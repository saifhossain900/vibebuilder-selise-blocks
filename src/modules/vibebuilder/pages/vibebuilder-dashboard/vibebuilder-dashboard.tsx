import { useEffect, useMemo, useState } from 'react';
import { getWebsitePages, getWebsiteProjects } from '../../services/vibebuilder.service';
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

export const VibeBuilderDashboardPage = () => {
  const [projects, setProjects] = useState<WebsiteProject[]>([]);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
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

    loadVibeBuilderData();
  }, []);

  const sortedPages = useMemo(() => {
    return [...pages].sort((firstPage, secondPage) => {
      return firstPage.displayOrder - secondPage.displayOrder;
    });
  }, [pages]);

  const firstProject = projects[0];

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

      {!isLoading && !errorMessage && firstProject && (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{firstProject.siteName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{firstProject.description}</p>
            </div>

            <div className="rounded-full border px-3 py-1 text-sm">
              {firstProject.isPublished ? 'Published' : 'Draft'}
            </div>
          </div>

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