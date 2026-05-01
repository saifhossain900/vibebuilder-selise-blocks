import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LiveRenderer } from '../../components/live-renderer';
import { getWebsitePages } from '../../services/vibebuilder.service';
import { WebsitePage } from '../../types/vibebuilder.types';

export const VibeBuilderEditorPage = () => {
  const { projectId, pageId } = useParams();
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadPages = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const pageResult = await getWebsitePages();
        setPages(pageResult.getWebsitePages.items ?? []);
      } catch (error) {
        console.error('Failed to load VibeBuilder editor data:', error);
        setErrorMessage('Could not load page data from SELISE Data Gateway.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPages();
  }, []);

  const sortedPages = useMemo(() => {
    return [...pages]
      .filter((page) => page.projectId === projectId)
      .sort((firstPage, secondPage) => firstPage.displayOrder - secondPage.displayOrder);
  }, [pages, projectId]);

  const activePage = sortedPages.find((page) => page.ItemId === pageId);

  if (isLoading) {
    return <div className="p-6">Loading builder workspace...</div>;
  }

  if (errorMessage) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!activePage) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground">
          The selected page could not be found in SELISE Data Gateway.
        </p>
        <Link className="text-blue-600 underline" to="/vibebuilder">
          Back to VibeBuilder dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">VibeBuilder Editor</p>
          <h1 className="text-3xl font-bold tracking-tight">{activePage.pageName}</h1>
          <p className="mt-2 text-muted-foreground">
            Editing /{activePage.pageSlug}. This page layout is loaded from WebsitePage.layoutJson.
          </p>
        </div>

        <Link
          className="rounded-lg border bg-card px-4 py-2 text-sm font-medium shadow-sm"
          to="/vibebuilder"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr_320px]">
        <aside className="rounded-2xl border bg-card p-4 shadow-sm">
          <h2 className="font-semibold">Pages</h2>
          <div className="mt-4 space-y-2">
            {sortedPages.map((page) => (
              <Link
                key={page.ItemId}
                to={`/vibebuilder/builder/${page.projectId}/${page.ItemId}`}
                className={`block rounded-lg border px-3 py-2 text-sm ${
                  page.ItemId === activePage.ItemId
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'bg-background'
                }`}
              >
                <div className="font-medium">{page.pageName}</div>
                <div className="text-xs text-muted-foreground">/{page.pageSlug}</div>
              </Link>
            ))}
          </div>
        </aside>

        <main className="rounded-2xl border bg-background p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Live Preview</h2>
            <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              layoutJson preview
            </span>
          </div>

          <LiveRenderer layoutJson={activePage.layoutJson} />
        </main>

        <aside className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
          <div>
            <h2 className="font-semibold">Page Details</h2>
            <div className="mt-3 space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Page:</span> {activePage.pageName}
              </p>
              <p>
                <span className="text-muted-foreground">Slug:</span> /{activePage.pageSlug}
              </p>
              <p>
                <span className="text-muted-foreground">Home Page:</span>{' '}
                {activePage.isHomePage ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <h3 className="font-semibold">Next Builder Features</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Drag blocks into this canvas</li>
              <li>Edit selected block properties</li>
              <li>Save updated layoutJson to SELISE</li>
              <li>Generate layout from prompt</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Stored layoutJson</h3>
            <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
              {JSON.stringify(JSON.parse(activePage.layoutJson), null, 2)}
            </pre>
          </div>
        </aside>
      </div>
    </div>
  );
};