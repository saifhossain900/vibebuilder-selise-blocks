import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LiveRenderer } from '../../components/live-renderer';
import { getWebsitePages, getWebsiteProjects } from '../../services/vibebuilder.service';
import { WebsitePage, WebsiteProject } from '../../types/vibebuilder.types';

export const VibeBuilderLiveSitePage = () => {
  const { siteSlug, pageSlug } = useParams();
  const [projects, setProjects] = useState<WebsiteProject[]>([]);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadLiveSite = async () => {
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
        console.error('Failed to load live site:', error);
        setErrorMessage('Could not load this website from SELISE Data Gateway.');
      } finally {
        setIsLoading(false);
      }
    };

    loadLiveSite();
  }, []);

  const activeProject = useMemo(() => {
    return projects.find((project) => project.siteSlug === siteSlug && project.isPublished);
  }, [projects, siteSlug]);

  const projectPages = useMemo(() => {
    if (!activeProject) {
      return [];
    }

    return [...pages]
      .filter((page) => page.projectId === activeProject.ItemId)
      .sort((firstPage, secondPage) => firstPage.displayOrder - secondPage.displayOrder);
  }, [activeProject, pages]);

  const activePage = useMemo(() => {
    const requestedPage = projectPages.find((page) => page.pageSlug === pageSlug);

    if (requestedPage) {
      return requestedPage;
    }

    return projectPages.find((page) => page.isHomePage);
  }, [pageSlug, projectPages]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <p className="text-muted-foreground">Loading website...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!activeProject || !activePage) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-3xl font-bold">Website not found</h1>
          <p className="mt-3 text-muted-foreground">
            This website may not exist, may be unpublished, or the page slug is incorrect.
          </p>
          <Link className="mt-6 inline-flex text-blue-600 underline" to="/vibebuilder">
            Back to VibeBuilder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{activeProject.siteName}</h1>
            {activeProject.description && (
              <p className="mt-1 text-sm text-muted-foreground">{activeProject.description}</p>
            )}
          </div>

          <nav className="flex flex-wrap gap-2">
            {projectPages.map((page) => (
              <Link
                key={page.ItemId}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  page.ItemId === activePage.ItemId
                    ? 'bg-blue-600 text-white'
                    : 'border bg-background text-foreground'
                }`}
                to={`/site/${activeProject.siteSlug}/${page.pageSlug}`}
              >
                {page.pageName}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <LiveRenderer layoutJson={activePage.layoutJson} />
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto max-w-6xl px-6 py-5 text-sm text-muted-foreground">
          Built with VibeBuilder on SELISE Blocks.
        </div>
      </footer>
    </div>
  );
};