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
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34%,#eef2ff_68%,#f8fafc_100%)] px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/80 bg-white/90 p-8 text-slate-700 shadow-xl shadow-slate-200/80 backdrop-blur">
          Loading website...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34%,#eef2ff_68%,#f8fafc_100%)] px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-200 bg-red-50/90 p-8 text-red-700 shadow-xl shadow-red-100 backdrop-blur">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!activeProject || !activePage) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34%,#eef2ff_68%,#f8fafc_100%)] px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/80 bg-white/95 p-8 shadow-xl shadow-slate-200/80 backdrop-blur">
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            VibeBuilder Live Site
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            Website not found
          </h1>
          <p className="mt-3 leading-7 text-slate-500">
            This website may not exist, may be unpublished, or the page slug is incorrect.
          </p>
          <Link
            className="mt-6 inline-flex rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
            to="/vibebuilder"
          >
            Back to VibeBuilder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34%,#eef2ff_68%,#f8fafc_100%)]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-400/25 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/85 shadow-sm shadow-slate-200/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <Link
              className="block truncate text-2xl font-bold tracking-tight text-slate-950 transition hover:text-blue-700"
              to={`/site/${activeProject.siteSlug}/${activePage.pageSlug}`}
            >
              {activeProject.siteName}
            </Link>

            {activeProject.description && (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
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
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-blue-600/25'
                      : 'border border-slate-200 bg-white/90 text-slate-700 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg hover:shadow-blue-100'
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

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="mb-6 overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-2xl shadow-blue-950/20 md:p-8">
          <div className="relative">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100">
                  VibeBuilder Live Site
                </p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                  {activePage.pageName}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  {activeProject.siteName} / {activePage.pageName}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-200">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 shadow-sm backdrop-blur">
                  Published
                </span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 shadow-sm backdrop-blur">
                  {projectPages.length} pages
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 p-3 shadow-xl shadow-slate-200/80 backdrop-blur sm:p-5">
          <LiveRenderer layoutJson={activePage.layoutJson} />
        </div>
      </main>

      <footer className="relative border-t border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>Built with VibeBuilder on SELISE Blocks.</p>
          <p className="font-medium text-slate-600">
            {activeProject.siteName} / {activePage.pageName}
          </p>
        </div>
      </footer>
    </div>
  );
};