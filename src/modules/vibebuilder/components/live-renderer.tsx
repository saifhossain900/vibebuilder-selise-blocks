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
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-900/10 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-300/60 md:p-12">
      <div className="absolute inset-0">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.22),transparent_42%,rgba(14,165,233,0.15))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_38%)]" />
      </div>

      <div className="relative max-w-4xl">
        <p className="inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100 shadow-sm backdrop-blur">
          Built with VibeBuilder
        </p>

        <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
          {props?.title || 'Untitled Hero Section'}
        </h1>

        {props?.subtitle && (
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200 md:text-lg">
            {props.subtitle}
          </p>
        )}

        {props?.buttonText && (
          <a
            className="mt-8 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-2xl"
            href={getButtonHref(props.buttonLink)}
          >
            {props.buttonText}
          </a>
        )}
      </div>
    </section>
  );
};

const TextBlock = ({ props }: { props?: LayoutComponent['props'] }) => {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70 md:p-9">
      <div className="max-w-4xl">
        <div className="mb-4 h-1.5 w-14 rounded-full bg-blue-600" />

        <h2 className="text-3xl font-bold tracking-tight text-slate-950">
          {props?.heading || 'Untitled Text Section'}
        </h2>

        {props?.body && (
          <p className="mt-4 text-base leading-8 text-slate-600">
            {props.body}
          </p>
        )}
      </div>
    </section>
  );
};

const CtaBlock = ({ props }: { props?: LayoutComponent['props'] }) => {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-blue-600 p-8 text-white shadow-2xl shadow-blue-200/70 md:p-10">
      <div className="absolute inset-0">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_55%)]" />
      </div>

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {props?.title || 'Call to Action'}
          </h2>

          {props?.subtitle && (
            <p className="mt-4 text-base leading-8 text-blue-50">
              {props.subtitle}
            </p>
          )}
        </div>

        {props?.buttonText && (
          <a
            className="inline-flex shrink-0 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-2xl"
            href={getButtonHref(props.buttonLink)}
          >
            {props.buttonText}
          </a>
        )}
      </div>
    </section>
  );
};

const ImageBlock = ({ props }: { props?: LayoutComponent['props'] }) => {
  return (
    <section className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      {props?.imageUrl ? (
        <div className="overflow-hidden">
          <img
            alt={props.altText || 'VibeBuilder image block'}
            className="h-80 w-full object-cover transition duration-500 group-hover:scale-[1.03] md:h-[28rem]"
            src={props.imageUrl}
          />
        </div>
      ) : (
        <div className="flex h-80 items-center justify-center bg-slate-100 text-sm text-slate-500 md:h-[28rem]">
          Add an image URL from the Properties Panel.
        </div>
      )}

      {(props?.caption || props?.altText) && (
        <div className="border-t border-slate-100 bg-white p-6">
          {props.caption && (
            <p className="text-lg font-semibold text-slate-950">{props.caption}</p>
          )}
          {props.altText && (
            <p className="mt-2 text-sm leading-6 text-slate-500">{props.altText}</p>
          )}
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
    <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70 md:p-10">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Services
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
          {props?.title || 'Services'}
        </h2>

        {props?.subtitle && (
          <p className="mt-4 text-base leading-8 text-slate-600">{props.subtitle}</p>
        )}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {services.map((service, index) => (
          <div
            key={`${service.title}-${index}`}
            className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:bg-white hover:shadow-xl hover:shadow-blue-100"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-200">
              {index + 1}
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-950">{service.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{service.body}</p>
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
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-300/70 md:p-10">
      <div className="absolute inset-0">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">
            Testimonials
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {props?.title || 'What People Say'}
          </h2>

          {props?.subtitle && (
            <p className="mt-4 text-base leading-8 text-slate-300">{props.subtitle}</p>
          )}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.name}-${index}`}
              className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:bg-white/15 hover:shadow-xl"
            >
              <div className="text-4xl font-bold leading-none text-blue-200">“</div>

              <p className="mt-3 text-sm leading-7 text-slate-200">{testimonial.quote}</p>

              <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-950">
                  {testimonial.name.charAt(0).toUpperCase()}
                </div>

                <p className="font-semibold text-white">{testimonial.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const UnknownBlock = ({ component }: { component: LayoutComponent }) => {
  return (
    <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-6 text-slate-500 shadow-sm">
      Unsupported component type: <span className="font-semibold">{component.type}</span>
    </section>
  );
};

export const LiveRenderer = ({ layoutJson }: LiveRendererProps) => {
  const components = parseLayoutJson(layoutJson);

  if (components.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">
        No layout components found in this page.
      </div>
    );
  }

  return (
    <div className="space-y-5">
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