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

const getButtonHref = (buttonLink?: string): string => {
  const cleanLink = buttonLink?.trim();

  if (!cleanLink) {
    return '#';
  }

  return cleanLink;
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
        <a
          className="mt-6 inline-flex rounded-lg bg-white px-4 py-2 font-medium text-slate-950 transition hover:bg-slate-100"
          href={getButtonHref(props.buttonLink)}
        >
          {props.buttonText}
        </a>
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
        <a
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
          href={getButtonHref(props.buttonLink)}
        >
          {props.buttonText}
        </a>
      )}
    </section>
  );
};

const ImageBlock = ({ props }: { props?: LayoutComponent['props'] }) => {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {props?.imageUrl ? (
        <img
          alt={props.altText || 'VibeBuilder image block'}
          className="h-72 w-full object-cover"
          src={props.imageUrl}
        />
      ) : (
        <div className="flex h-72 items-center justify-center bg-slate-100 text-sm text-muted-foreground">
          Add an image URL from the Properties Panel.
        </div>
      )}

      {(props?.caption || props?.altText) && (
        <div className="p-4">
          {props.caption && <p className="font-medium">{props.caption}</p>}
          {props.altText && <p className="mt-1 text-sm text-muted-foreground">{props.altText}</p>}
        </div>
      )}
    </section>
  );
};

const ServicesBlock = ({ props }: { props?: LayoutComponent['props'] }) => {
  const services = [
    {
      title: props?.serviceOneTitle || 'Service One',
      body: props?.serviceOneBody || 'Describe the first service or feature.',
    },
    {
      title: props?.serviceTwoTitle || 'Service Two',
      body: props?.serviceTwoBody || 'Describe the second service or feature.',
    },
    {
      title: props?.serviceThreeTitle || 'Service Three',
      body: props?.serviceThreeBody || 'Describe the third service or feature.',
    },
  ];

  return (
    <section className="rounded-2xl border bg-card p-8 shadow-sm">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{props?.title || 'Services'}</h2>
        {props?.subtitle && (
          <p className="mt-3 max-w-2xl text-muted-foreground">{props.subtitle}</p>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {services.map((service) => (
          <div key={service.title} className="rounded-xl border bg-background p-5">
            <h3 className="font-semibold">{service.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{service.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const TestimonialsBlock = ({ props }: { props?: LayoutComponent['props'] }) => {
  const testimonials = [
    {
      name: props?.testimonialOneName || 'Client One',
      quote:
        props?.testimonialOneQuote ||
        'This website clearly presents the value and makes the business look professional.',
    },
    {
      name: props?.testimonialTwoName || 'Client Two',
      quote:
        props?.testimonialTwoQuote ||
        'The layout is clean, useful, and easy for visitors to understand.',
    },
    {
      name: props?.testimonialThreeName || 'Client Three',
      quote:
        props?.testimonialThreeQuote ||
        'A strong website section for building trust with future customers.',
    },
  ];

  return (
    <section className="rounded-2xl border bg-slate-50 p-8 shadow-sm">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {props?.title || 'What People Say'}
        </h2>

        {props?.subtitle && (
          <p className="mt-3 max-w-2xl text-muted-foreground">{props.subtitle}</p>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <div key={testimonial.name} className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm leading-6 text-muted-foreground">
              {`"${testimonial.quote}"`}
            </p>
            <p className="mt-4 font-semibold">{testimonial.name}</p>
          </div>
        ))}
      </div>
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

        if (component.type === 'image') {
          return <ImageBlock key={component.id} props={component.props} />;
        }

        if (component.type === 'services') {
          return <ServicesBlock key={component.id} props={component.props} />;
        }

        if (component.type === 'testimonials') {
          return <TestimonialsBlock key={component.id} props={component.props} />;
        }

        return <UnknownBlock key={component.id} component={component} />;
      })}
    </div>
  );
};