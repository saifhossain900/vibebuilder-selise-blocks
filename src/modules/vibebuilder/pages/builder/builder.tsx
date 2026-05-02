import { useEffect, useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LiveRenderer } from '../../components/live-renderer';
import { getWebsitePages, updateWebsitePageLayout } from '../../services/vibebuilder.service';
import {
  LayoutComponent,
  LayoutComponentType,
  LayoutData,
  WebsitePage,
} from '../../types/vibebuilder.types';
import { generateLayoutFromPrompt } from '../../utils/prompt-layout-generator';

const createComponent = (type: LayoutComponentType): LayoutComponent => {
  const id = `${type}_${Date.now()}`;

  if (type === 'hero') {
    return {
      id,
      type,
      props: {
        title: 'New Hero Section',
        subtitle: 'Describe your website or page here.',
        buttonText: 'Get Started',
        buttonLink: '#',
      },
    };
  }

  if (type === 'cta') {
    return {
      id,
      type,
      props: {
        title: 'Ready to take action?',
        subtitle: 'Add a short message and guide visitors to the next step.',
        buttonText: 'Contact Now',
        buttonLink: '#',
      },
    };
  }

  if (type === 'image') {
    return {
      id,
      type,
      props: {
        imageUrl:
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
        altText: 'Workspace desk with laptop',
        caption: 'A professional image section for your website.',
      },
    };
  }

  if (type === 'services') {
    return {
      id,
      type,
      props: {
        title: 'Our Services',
        subtitle: 'Highlight the main services or features offered by this website.',
        serviceOneTitle: 'Strategy',
        serviceOneBody: 'Plan the right direction with clear goals and useful decisions.',
        serviceTwoTitle: 'Design',
        serviceTwoBody: 'Create clean, modern, and user-friendly digital experiences.',
        serviceThreeTitle: 'Delivery',
        serviceThreeBody: 'Build and launch reliable solutions that are easy to maintain.',
      },
    };
  }

  if (type === 'testimonials') {
    return {
      id,
      type,
      props: {
        title: 'What People Say',
        subtitle: 'Build trust by showing feedback from clients, customers, or users.',
        testimonialOneName: 'Client One',
        testimonialOneQuote:
          'This website clearly presents the value and makes the business look professional.',
        testimonialTwoName: 'Client Two',
        testimonialTwoQuote: 'The layout is clean, useful, and easy for visitors to understand.',
        testimonialThreeName: 'Client Three',
        testimonialThreeQuote: 'A strong website section for building trust with future customers.',
      },
    };
  }

  return {
    id,
    type,
    props: {
      heading: 'New Text Section',
      body: 'Write your content here.',
    },
  };
};

const parseLayout = (layoutJson: string): LayoutData => {
  try {
    const parsed = JSON.parse(layoutJson) as Partial<LayoutData>;

    return {
      components: Array.isArray(parsed.components) ? parsed.components : [],
    };
  } catch {
    return { components: [] };
  }
};

const stringifyLayout = (components: LayoutComponent[]): string => {
  return JSON.stringify({ components });
};

export const VibeBuilderEditorPage = () => {
  const { projectId, pageId } = useParams();
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [components, setComponents] = useState<LayoutComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState('');
  const [draggedComponentId, setDraggedComponentId] = useState('');
  const [promptText, setPromptText] = useState('');
  const [isGeneratingFromPrompt, setIsGeneratingFromPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadPages = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        const pageResult = await getWebsitePages();
        const loadedPages = pageResult.getWebsitePages.items ?? [];
        const activePage = loadedPages.find((page) => page.ItemId === pageId);

        setPages(loadedPages);
        setComponents(activePage ? parseLayout(activePage.layoutJson).components : []);
        setSelectedComponentId('');
      } catch (error) {
        console.error('Failed to load VibeBuilder editor data:', error);
        setErrorMessage('Could not load page data from SELISE Data Gateway.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPages();
  }, [pageId]);

  const sortedPages = useMemo(() => {
    return [...pages]
      .filter((page) => page.projectId === projectId)
      .sort((firstPage, secondPage) => firstPage.displayOrder - secondPage.displayOrder);
  }, [pages, projectId]);

  const activePage = sortedPages.find((page) => page.ItemId === pageId);

  const selectedComponent = components.find((component) => {
    return component.id === selectedComponentId;
  });

  const draftLayoutJson = useMemo(() => stringifyLayout(components), [components]);

  const addComponent = (type: LayoutComponentType) => {
    const newComponent = createComponent(type);
    setComponents((currentComponents) => [...currentComponents, newComponent]);
    setSelectedComponentId(newComponent.id);
    setSuccessMessage('');
  };

  const updateSelectedComponentProp = (key: keyof LayoutComponent['props'], value: string) => {
    if (!selectedComponent) {
      return;
    }

    setComponents((currentComponents) =>
      currentComponents.map((component) => {
        if (component.id !== selectedComponent.id) {
          return component;
        }

        return {
          ...component,
          props: {
            ...component.props,
            [key]: value,
          },
        };
      })
    );

    setSuccessMessage('');
  };

  const deleteSelectedComponent = () => {
    if (!selectedComponent) {
      return;
    }

    setComponents((currentComponents) =>
      currentComponents.filter((component) => component.id !== selectedComponent.id)
    );
    setSelectedComponentId('');
    setSuccessMessage('');
  };

  const moveComponent = (componentId: string, direction: 'up' | 'down') => {
    setComponents((currentComponents) => {
      const currentIndex = currentComponents.findIndex((component) => component.id === componentId);

      if (currentIndex === -1) {
        return currentComponents;
      }

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= currentComponents.length) {
        return currentComponents;
      }

      const updatedComponents = [...currentComponents];
      const [movedComponent] = updatedComponents.splice(currentIndex, 1);
      updatedComponents.splice(targetIndex, 0, movedComponent);

      return updatedComponents;
    });

    setSuccessMessage('');
  };

  const handleDropOnComponent = (targetComponentId: string) => {
    if (!draggedComponentId || draggedComponentId === targetComponentId) {
      return;
    }

    setComponents((currentComponents) => {
      const draggedIndex = currentComponents.findIndex(
        (component) => component.id === draggedComponentId
      );
      const targetIndex = currentComponents.findIndex(
        (component) => component.id === targetComponentId
      );

      if (draggedIndex === -1 || targetIndex === -1) {
        return currentComponents;
      }

      const updatedComponents = [...currentComponents];
      const [draggedComponent] = updatedComponents.splice(draggedIndex, 1);
      updatedComponents.splice(targetIndex, 0, draggedComponent);

      return updatedComponents;
    });

    setDraggedComponentId('');
    setSuccessMessage('');
  };

  const handleGenerateFromPrompt = () => {
    const cleanPrompt = promptText.trim();

    if (!cleanPrompt) {
      setErrorMessage('Write a prompt first, then generate a layout.');
      return;
    }

    setIsGeneratingFromPrompt(true);
    setErrorMessage('');
    setSuccessMessage('');

    const generatedComponents = generateLayoutFromPrompt(cleanPrompt);

    setComponents(generatedComponents);
    setSelectedComponentId(generatedComponents[0]?.id ?? '');
    setSuccessMessage('Prompt converted into editable layoutJson. Review it, then save.');
    setIsGeneratingFromPrompt(false);
  };

  const saveLayout = async () => {
    if (!activePage) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      await updateWebsitePageLayout(activePage.ItemId, draftLayoutJson);

      setPages((currentPages) =>
        currentPages.map((page) => {
          if (page.ItemId !== activePage.ItemId) {
            return page;
          }

          return {
            ...page,
            layoutJson: draftLayoutJson,
          };
        })
      );

      setSuccessMessage('Page layout saved to SELISE Data Gateway.');
    } catch (error) {
      console.error('Failed to save layoutJson:', error);
      setErrorMessage('Could not save layoutJson to SELISE Data Gateway.');
    } finally {
      setIsSaving(false);
    }
  };

  const allowDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  if (isLoading) {
    return <div className="p-6">Loading builder workspace...</div>;
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
            Editing /{activePage.pageSlug}. Add, edit, reorder, prompt-generate, and save page
            blocks as layoutJson.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-60"
            disabled={isSaving}
            onClick={saveLayout}
            type="button"
          >
            {isSaving ? 'Saving...' : 'Save layoutJson'}
          </button>

          <Link
            className="rounded-lg border bg-card px-4 py-2 text-sm font-medium shadow-sm"
            to="/vibebuilder"
          >
            Back
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
          {successMessage}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[280px_1fr_340px]">
        <aside className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
          <div>
            <h2 className="font-semibold">Pages</h2>
            <div className="mt-3 space-y-2">
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
          </div>

          <div className="border-t pt-4">
            <h2 className="font-semibold">Component Library</h2>
            <div className="mt-3 space-y-2">
              <button
                className="w-full rounded-lg border bg-background px-3 py-2 text-left text-sm hover:bg-blue-50"
                onClick={() => addComponent('hero')}
                type="button"
              >
                + Hero Block
              </button>

              <button
                className="w-full rounded-lg border bg-background px-3 py-2 text-left text-sm hover:bg-blue-50"
                onClick={() => addComponent('text')}
                type="button"
              >
                + Text Block
              </button>

              <button
                className="w-full rounded-lg border bg-background px-3 py-2 text-left text-sm hover:bg-blue-50"
                onClick={() => addComponent('cta')}
                type="button"
              >
                + CTA Block
              </button>

              <button
                className="w-full rounded-lg border bg-background px-3 py-2 text-left text-sm hover:bg-blue-50"
                onClick={() => addComponent('image')}
                type="button"
              >
                + Image Block
              </button>

              <button
                className="w-full rounded-lg border bg-background px-3 py-2 text-left text-sm hover:bg-blue-50"
                onClick={() => addComponent('services')}
                type="button"
              >
                + Services Block
              </button>

              <button
                className="w-full rounded-lg border bg-background px-3 py-2 text-left text-sm hover:bg-blue-50"
                onClick={() => addComponent('testimonials')}
                type="button"
              >
                + Testimonials Block
              </button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h2 className="font-semibold">Prompt Builder</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe the page you want. VibeBuilder will generate editable layoutJson.
            </p>

            <textarea
              className="mt-3 min-h-28 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              placeholder="Example: Make me a portfolio homepage with hero, about section, and contact CTA"
              value={promptText}
              onChange={(event) => setPromptText(event.target.value)}
            />

            <button
              className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={isGeneratingFromPrompt}
              onClick={handleGenerateFromPrompt}
              type="button"
            >
              {isGeneratingFromPrompt ? 'Generating...' : 'Generate Layout'}
            </button>

            <p className="mt-2 text-xs text-muted-foreground">
              Generated blocks are editable. Click Save layoutJson to persist them in SELISE Data
              Gateway.
            </p>
          </div>
        </aside>

        <main className="rounded-2xl border bg-background p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold">Builder Canvas</h2>
              <p className="text-sm text-muted-foreground">
                Click a block to edit it. Drag blocks to reorder them.
              </p>
            </div>

            <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              {components.length} blocks
            </span>
          </div>

          <div className="space-y-3">
            {components.map((component, index) => (
              <div
                key={component.id}
                draggable
                onClick={() => setSelectedComponentId(component.id)}
                onDragStart={() => setDraggedComponentId(component.id)}
                onDragOver={allowDrop}
                onDrop={() => handleDropOnComponent(component.id)}
                className={`rounded-2xl border p-3 transition ${
                  selectedComponentId === component.id
                    ? 'border-blue-400 bg-blue-50'
                    : 'bg-card hover:border-blue-200'
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {component.type} block
                    </p>
                    <p className="text-sm text-muted-foreground">Position {index + 1}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="rounded border px-2 py-1 text-xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        moveComponent(component.id, 'up');
                      }}
                      type="button"
                    >
                      ↑
                    </button>

                    <button
                      className="rounded border px-2 py-1 text-xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        moveComponent(component.id, 'down');
                      }}
                      type="button"
                    >
                      ↓
                    </button>
                  </div>
                </div>

                <LiveRenderer layoutJson={stringifyLayout([component])} />
              </div>
            ))}

            {components.length === 0 && (
              <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-muted-foreground">
                No blocks yet. Add a block from the Component Library or generate a layout from a
                prompt.
              </div>
            )}
          </div>
        </main>

        <aside className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
          <div>
            <h2 className="font-semibold">Properties Panel</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Edit the selected block. Changes update the preview immediately.
            </p>
          </div>

          {!selectedComponent && (
            <div className="rounded-xl border border-dashed bg-background p-4 text-sm text-muted-foreground">
              Select a block from the canvas to edit its content.
            </div>
          )}

          {selectedComponent && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-background p-4">
                <p className="text-sm font-semibold">Selected: {selectedComponent.type}</p>
                <p className="mt-1 break-all text-xs text-muted-foreground">
                  {selectedComponent.id}
                </p>
              </div>

              {(selectedComponent.type === 'hero' || selectedComponent.type === 'cta') && (
                <>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Title</span>
                    <input
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.title ?? ''}
                      onChange={(event) => updateSelectedComponentProp('title', event.target.value)}
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Subtitle</span>
                    <textarea
                      className="min-h-24 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.subtitle ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('subtitle', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Button Text</span>
                    <input
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.buttonText ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('buttonText', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Button Link</span>
                    <input
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      placeholder="#, /site/agency-site/contact, mailto:hello@example.com"
                      value={selectedComponent.props.buttonLink ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('buttonLink', event.target.value)
                      }
                    />
                    <span className="block text-xs text-muted-foreground">
                      Use #, a public page path, mailto:, tel:, or a full https:// link.
                    </span>
                  </label>
                </>
              )}

              {selectedComponent.type === 'text' && (
                <>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Heading</span>
                    <input
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.heading ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('heading', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Body</span>
                    <textarea
                      className="min-h-32 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.body ?? ''}
                      onChange={(event) => updateSelectedComponentProp('body', event.target.value)}
                    />
                  </label>
                </>
              )}

              {selectedComponent.type === 'image' && (
                <>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Image URL</span>
                    <input
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.imageUrl ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('imageUrl', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Alt Text</span>
                    <input
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.altText ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('altText', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Caption</span>
                    <textarea
                      className="min-h-24 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.caption ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('caption', event.target.value)
                      }
                    />
                  </label>
                </>
              )}

              {selectedComponent.type === 'services' && (
                <>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Section Title</span>
                    <input
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.title ?? ''}
                      onChange={(event) => updateSelectedComponentProp('title', event.target.value)}
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Section Subtitle</span>
                    <textarea
                      className="min-h-20 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.subtitle ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('subtitle', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Service 1 Title</span>
                    <input
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.serviceOneTitle ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('serviceOneTitle', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Service 1 Body</span>
                    <textarea
                      className="min-h-20 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.serviceOneBody ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('serviceOneBody', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Service 2 Title</span>
                    <input
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.serviceTwoTitle ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('serviceTwoTitle', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Service 2 Body</span>
                    <textarea
                      className="min-h-20 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.serviceTwoBody ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('serviceTwoBody', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Service 3 Title</span>
                    <input
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.serviceThreeTitle ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('serviceThreeTitle', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Service 3 Body</span>
                    <textarea
                      className="min-h-20 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.serviceThreeBody ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('serviceThreeBody', event.target.value)
                      }
                    />
                  </label>
                </>
              )}

              {selectedComponent.type === 'testimonials' && (
                <>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Section Title</span>
                    <input
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.title ?? ''}
                      onChange={(event) => updateSelectedComponentProp('title', event.target.value)}
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Section Subtitle</span>
                    <textarea
                      className="min-h-20 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.subtitle ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('subtitle', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Testimonial 1 Name</span>
                    <input
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.testimonialOneName ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('testimonialOneName', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Testimonial 1 Quote</span>
                    <textarea
                      className="min-h-20 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.testimonialOneQuote ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('testimonialOneQuote', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Testimonial 2 Name</span>
                    <input
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.testimonialTwoName ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('testimonialTwoName', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Testimonial 2 Quote</span>
                    <textarea
                      className="min-h-20 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.testimonialTwoQuote ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('testimonialTwoQuote', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Testimonial 3 Name</span>
                    <input
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.testimonialThreeName ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('testimonialThreeName', event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Testimonial 3 Quote</span>
                    <textarea
                      className="min-h-20 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedComponent.props.testimonialThreeQuote ?? ''}
                      onChange={(event) =>
                        updateSelectedComponentProp('testimonialThreeQuote', event.target.value)
                      }
                    />
                  </label>
                </>
              )}

              <button
                className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                onClick={deleteSelectedComponent}
                type="button"
              >
                Delete Selected Block
              </button>
            </div>
          )}

          <div className="rounded-xl border bg-background p-4">
            <h3 className="font-semibold">Stored layoutJson Preview</h3>
            <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
              {JSON.stringify(JSON.parse(draftLayoutJson), null, 2)}
            </pre>
          </div>
        </aside>
      </div>
    </div>
  );
};