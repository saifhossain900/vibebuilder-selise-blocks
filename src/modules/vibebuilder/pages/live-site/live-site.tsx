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
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <p className="text-muted-foreground">Loading website...</p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!activeProject || !activePage) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            VibeBuilder Live Site
          </p>
          <h1 className="mt-3 text-3xl font-bold">Website not found</h1>
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
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <Link
              className="block truncate text-2xl font-bold tracking-tight text-slate-950"
              to={`/site/${activeProject.siteSlug}/${activePage.pageSlug}`}
            >
              {activeProject.siteName}
            </Link>

            {activeProject.description && (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {activeProject.description}
              </p>
            )}
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1 xl:flex-wrap xl:justify-end xl:overflow-visible xl:pb-0">
            {projectPages.map((page) => {
              const isActive = page.ItemId === activePage.ItemId;

              return (
                <Link
                  key={page.ItemId}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  to={`/site/${activeProject.siteSlug}/${page.pageSlug}`}
                >
                  {page.pageName}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="rounded-[1.5rem] bg-white p-3 shadow-sm sm:p-5">
          <LiveRenderer layoutJson={activePage.layoutJson} />
        </div>
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>Built with VibeBuilder on SELISE Blocks.</p>
          <p>
            {activeProject.siteName} / {activePage.pageName}
          </p>
        </div>
      </footer>
    </div>
  );
};