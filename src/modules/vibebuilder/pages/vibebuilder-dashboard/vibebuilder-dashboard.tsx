export const VibeBuilderDashboardPage = () => {
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
          <p className="mt-2 text-sm text-muted-foreground">
            Website projects will be loaded from the WebsiteProject schema.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Pages</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Home, About, Services, and Contact pages are stored in WebsitePage.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Layout JSON</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Drag-and-drop layouts are saved as serialized JSON in layoutJson.
          </p>
        </div>
      </div>
    </div>
  );
};