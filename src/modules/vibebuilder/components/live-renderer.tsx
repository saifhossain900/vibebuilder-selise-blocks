import { LayoutComponent, LayoutData } from '../types/vibebuilder.types';

type LiveRendererProps = {
  layoutJson: string;
};

const parseLayoutJson = (layoutJson: string): LayoutComponent[] => {
  try {
    const parsedLayout = JSON.parse(layoutJson) as Partial<LayoutData>;
    return Array.isArray(parsedLayout.components) ? parsedLayout.components : [];
  } catch {
    return [];
  }
};

const HeroBlock = ({ props }: { props?: LayoutComponent['props'] }) => {
  return (
    <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">
        Built with VibeBuilder
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">
        {props?.title || 'Untitled Hero Section'}
      </h1>
      {props?.subtitle && <p className="mt-3 max-w-2xl text-slate-200">{props.subtitle}</p>}
      {props?.buttonText && (
        <button className="mt-6 rounded-lg bg-white px-4 py-2 font-medium text-slate-950">
          {props.buttonText}
        </button>
      )}
    </section>
  );
};

const TextBlock = ({ props }: { props?: LayoutComponent['props'] }) => {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="text-2xl font-semibold">{props?.heading || 'Untitled Text Section'}</h2>
      {props?.body && <p className="mt-3 leading-7 text-muted-foreground">{props.body}</p>}
    </section>
  );
};

const CtaBlock = ({ props }: { props?: LayoutComponent['props'] }) => {
  return (
    <section className="rounded-2xl border bg-blue-50 p-8 shadow-sm">
      <h2 className="text-3xl font-bold tracking-tight">{props?.title || 'Call to Action'}</h2>
      {props?.subtitle && <p className="mt-3 max-w-2xl text-muted-foreground">{props.subtitle}</p>}
      {props?.buttonText && (
        <button className="mt-6 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white">
          {props.buttonText}
        </button>
      )}
    </section>
  );
};

const UnknownBlock = ({ component }: { component: LayoutComponent }) => {
  return (
    <section className="rounded-2xl border border-dashed bg-card p-6 text-muted-foreground">
      Unsupported component type: <span className="font-semibold">{component.type}</span>
    </section>
  );
};

export const LiveRenderer = ({ layoutJson }: LiveRendererProps) => {
  const components = parseLayoutJson(layoutJson);

  if (components.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-muted-foreground">
        No layout components found in this page.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {components.map((component) => {
        if (component.type === 'hero') {
          return <HeroBlock key={component.id} props={component.props} />;
        }

        if (component.type === 'text') {
          return <TextBlock key={component.id} props={component.props} />;
        }

        if (component.type === 'cta') {
          return <CtaBlock key={component.id} props={component.props} />;
        }

        return <UnknownBlock key={component.id} component={component} />;
      })}
    </div>
  );
};