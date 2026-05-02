import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createWebsitePage,
  deleteWebsitePage,
  getWebsitePages,
  getWebsiteProjects,
} from '../../services/vibebuilder.service';
import { WebsitePage, WebsiteProject } from '../../types/vibebuilder.types';

const getComponentCount = (layoutJson: string): number => {
  try {
    const parsedLayout = JSON.parse(layoutJson) as {
      components?: unknown[];
    };

    return Array.isArray(parsedLayout.components) ? parsedLayout.components.length : 0;
  } catch {
    return 0;
  }
};

const createSlug = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const createDefaultLayoutJson = (pageName: string): string => {
  return JSON.stringify({
    components: [
      {
        id: `hero_${Date.now()}`,
        type: 'hero',
        props: {
          title: pageName,
          subtitle: `This is the ${pageName} page built with VibeBuilder.`,
          buttonText: 'Get Started',
        },
      },
      {
        id: `text_${Date.now()}`,
        type: 'text',
        props: {
          heading: `About ${pageName}`,
          body: 'Edit this content in the VibeBuilder editor and save it to SELISE Data Gateway.',
        },
      },
    ],
  });
};

export const VibeBuilderDashboardPage = () => {
  const [projects, setProjects] = useState<WebsiteProject[]>([]);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [newPageName, setNewPageName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [deletingPageId, setDeletingPageId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadVibeBuilderData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const [projectResult, pageResult] = await Promise.all([
        getWebsiteProjects(),
        getWebsitePages(),
      ]);

      setProjects(projectResult.getWebsiteProjects.items ?? []);
      setPages(pageResult.getWebsitePages.items ?? []);
    } catch (error) {
      console.error('Failed to load VibeBuilder data:', error);
      setErrorMessage('Could not load VibeBuilder data from SELISE Data Gateway.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVibeBuilderData();
  }, []);

  const sortedPages = useMemo(() => {
    return [...pages].sort((firstPage, secondPage) => {
      return firstPage.displayOrder - secondPage.displayOrder;
    });
  }, [pages]);

  const firstProject = projects[0];

  const handleCreatePage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!firstProject) {
      setErrorMessage('Create a WebsiteProject first before adding pages.');
      return;
    }

    const pageName = newPageName.trim();
    const pageSlug = createSlug(pageName);

    if (!pageName || !pageSlug) {
      setErrorMessage('Please enter a valid page name.');
      return;
    }

    const slugAlreadyExists = pages.some((page) => page.pageSlug === pageSlug);

    if (slugAlreadyExists) {
      setErrorMessage('A page with this slug already exists. Use another page name.');
      return;
    }

    try {
      setIsCreatingPage(true);
      setErrorMessage('');
      setSuccessMessage('');

      await createWebsitePage({
        projectId: firstProject.ItemId,
        ownerUserId: firstProject.ownerUserId,
        pageName,
        pageSlug,
        layoutJson: createDefaultLayoutJson(pageName),
        displayOrder: sortedPages.length + 1,
        isHomePage: false,
      });

      setNewPageName('');
      setSuccessMessage(`${pageName} page created in SELISE Data Gateway.`);
      await loadVibeBuilderData();
    } catch (error) {
      console.error('Failed to create page:', error);
      setErrorMessage('Could not create page in SELISE Data Gateway.');
    } finally {
      setIsCreatingPage(false);
    }
  };

  const handleDeletePage = async (page: WebsitePage) => {
    if (page.isHomePage) {
      setErrorMessage('Home page cannot be deleted.');
      return;
    }

    try {
      setDeletingPageId(page.ItemId);
      setErrorMessage('');
      setSuccessMessage('');

      await deleteWebsitePage(page.ItemId);

      setSuccessMessage(`${page.pageName} page deleted from SELISE Data Gateway.`);
      await loadVibeBuilderData();
    } catch (error) {
      console.error('Failed to delete page:', error);
      setErrorMessage('Could not delete page from SELISE Data Gateway.');
    } finally {
      setDeletingPageId('');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-sm font-semibold text-blue-600">SELISE Blocks Project</p>
        <h1 className="text-3xl font-bold tracking-tight">VibeBuilder</h1>
        <p className="mt-2 text-muted-foreground">
          Drag-and-drop multi-page website builder powered by SELISE IAM, Data Gateway,
          and Media Block.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Website Projects</h2>
          <p className="mt-2 text-3xl font-bold">{projects.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Loaded from the WebsiteProject schema.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Pages</h2>
          <p className="mt-2 text-3xl font-bold">{pages.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Multi-page records loaded from WebsitePage.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Layout JSON</h2>
          <p className="mt-2 text-3xl font-bold">
            {pages.reduce((total, page) => total + getComponentCount(page.layoutJson), 0)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Serialized page components stored in layoutJson.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          Loading VibeBuilder data from SELISE Data Gateway...
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-green-700">
          {successMessage}
        </div>
      )}

      {!isLoading && !errorMessage && firstProject && (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{firstProject.siteName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{firstProject.description}</p>
            </div>

            <div className="rounded-full border px-3 py-1 text-sm">
              {firstProject.isPublished ? 'Published' : 'Draft'}
            </div>
          </div>

          <form
            className="mt-5 flex flex-col gap-3 rounded-xl border bg-background p-4 md:flex-row"
            onSubmit={handleCreatePage}
          >
            <input
              className="flex-1 rounded-lg border bg-card px-3 py-2 text-sm"
              placeholder="New page name, e.g. Portfolio"
              value={newPageName}
              onChange={(event) => setNewPageName(event.target.value)}
            />

            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={isCreatingPage}
              type="submit"
            >
              {isCreatingPage ? 'Creating...' : 'Create Page'}
            </button>
          </form>

          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {sortedPages.map((page) => (
              <div key={page.ItemId} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{page.pageName}</h3>
                  {page.isHomePage && (
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                      Home
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-muted-foreground">/{page.pageSlug}</p>

                <p className="mt-3 text-sm">
                  Components:{' '}
                  <span className="font-semibold">{getComponentCount(page.layoutJson)}</span>
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    className="inline-flex rounded-lg border px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                    to={`/vibebuilder/builder/${page.projectId}/${page.ItemId}`}
                  >
                    Open Builder
                  </Link>

                  <button
                    className="inline-flex rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={page.isHomePage || deletingPageId === page.ItemId}
                    onClick={() => handleDeletePage(page)}
                    type="button"
                  >
                    {deletingPageId === page.ItemId ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !errorMessage && !firstProject && (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          No website project found. Create a WebsiteProject record in SELISE Data Gateway first.
        </div>
      )}
    </div>
  );
};