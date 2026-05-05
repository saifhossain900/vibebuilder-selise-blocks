import { useEffect, useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LiveRenderer } from '../../components/live-renderer';
import { getWebsitePagesByProject, updateWebsitePageLayout } from '../../services/vibebuilder.service';
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
      if (!projectId || !pageId) {
        setErrorMessage('Missing project or page information in the builder URL.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        const pageResult = await getWebsitePagesByProject(projectId);
        const loadedPages = pageResult.getWebsitePages.items ?? [];
        const selectedPage = loadedPages.find((page) => page.ItemId === pageId);

        setPages(loadedPages);
        setComponents(selectedPage ? parseLayout(selectedPage.layoutJson).components : []);
        setSelectedComponentId('');

        if (!selectedPage) {
          setErrorMessage(
            'This page could not be loaded for this website. Go back to the dashboard, refresh, and open Builder from the page card again.'
          );
        }
      } catch (error) {
        console.error('Failed to load VibeBuilder editor data:', error);
        setErrorMessage('Could not load page data from SELISE Data Gateway.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPages();
  }, [pageId, projectId]);

  const sortedPages = useMemo(() => {
    return [...pages].sort(
      (firstPage, secondPage) => firstPage.displayOrder - secondPage.displayOrder
    );
  }, [pages]);

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

  const duplicateSelectedComponent = () => {
    if (!selectedComponent) {
      return;
    }

    const duplicatedComponent: LayoutComponent = {
      ...selectedComponent,
      id: `${selectedComponent.type}_${Date.now()}`,
      props: {
        ...selectedComponent.props,
      },
    };

    setComponents((currentComponents) => {
      const selectedIndex = currentComponents.findIndex((component) => {
        return component.id === selectedComponent.id;
      });

      if (selectedIndex === -1) {
        return [...currentComponents, duplicatedComponent];
      }

      const updatedComponents = [...currentComponents];
      updatedComponents.splice(selectedIndex + 1, 0, duplicatedComponent);

      return updatedComponents;
    });

    setSelectedComponentId(duplicatedComponent.id);
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
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34%,#eef2ff_68%,#f8fafc_100%)] px-6 py-10">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/80 bg-white/90 p-8 text-slate-700 shadow-xl shadow-slate-200/80 backdrop-blur">
          Loading builder workspace...
        </div>
      </div>
    );
  }

  if (!activePage) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34%,#eef2ff_68%,#f8fafc_100%)] px-6 py-10">
        <div className="mx-auto max-w-3xl space-y-4 rounded-[2rem] border border-white/80 bg-white/95 p-8 shadow-xl shadow-slate-200/80 backdrop-blur">
          <h1 className="text-2xl font-bold text-slate-950">Page not found</h1>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {errorMessage}
            </div>
          ) : (
            <p className="text-slate-500">
              The selected page could not be found in SELISE Data Gateway.
            </p>
          )}

          <Link
            className="inline-flex rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
            to="/vibebuilder"
          >
            Back to VibeBuilder dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34%,#eef2ff_68%,#f8fafc_100%)]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-400/30 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-2xl shadow-blue-950/20 md:p-8">
          <div className="absolute inset-0 opacity-80">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.20),transparent_45%,rgba(14,165,233,0.12))]" />
          </div>

          <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100 shadow-sm">
                VibeBuilder Editor
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                {activePage.pageName}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                Editing /{activePage.pageSlug}. Add, edit, reorder, prompt-generate, and save page
                blocks as layoutJson.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-200">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 shadow-sm backdrop-blur">
                  {components.length} blocks
                </span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 shadow-sm backdrop-blur">
                  {sortedPages.length} pages
                </span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 shadow-sm backdrop-blur">
                  Drag to reorder
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              <button
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
                onClick={saveLayout}
                type="button"
              >
                {isSaving ? 'Saving...' : 'Save layoutJson'}
              </button>

              <Link
                className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15 hover:shadow-xl"
                to="/vibebuilder"
              >
                Back
              </Link>
            </div>
          </div>
        </header>

        {errorMessage && (
          <div className="rounded-3xl border border-red-200 bg-red-50/90 p-5 text-red-700 shadow-xl shadow-red-100 backdrop-blur">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/90 p-5 text-emerald-700 shadow-xl shadow-emerald-100 backdrop-blur">
            {successMessage}
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_370px]">
          <aside className="space-y-4 rounded-[2rem] border border-white/80 bg-white/95 p-5 shadow-xl shadow-slate-200/80 backdrop-blur xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-auto">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Pages</h2>
              <div className="mt-3 space-y-2">
                {sortedPages.map((page) => (
                  <Link
                    key={page.ItemId}
                    to={`/vibebuilder/builder/${page.projectId}/${page.ItemId}`}
                    className={`block rounded-2xl border px-4 py-3 text-sm shadow-sm transition ${
                      page.ItemId === activePage.ItemId
                        ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-blue-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100'
                    }`}
                  >
                    <div className="font-semibold">{page.pageName}</div>
                    <div className="mt-1 text-xs text-slate-500">/{page.pageSlug}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h2 className="text-lg font-bold text-slate-950">Component Library</h2>
              <div className="mt-3 grid gap-2">
                <button
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg hover:shadow-blue-100"
                  onClick={() => addComponent('hero')}
                  type="button"
                >
                  + Hero Block
                </button>

                <button
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg hover:shadow-blue-100"
                  onClick={() => addComponent('text')}
                  type="button"
                >
                  + Text Block
                </button>

                <button
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg hover:shadow-blue-100"
                  onClick={() => addComponent('cta')}
                  type="button"
                >
                  + CTA Block
                </button>

                <button
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg hover:shadow-blue-100"
                  onClick={() => addComponent('image')}
                  type="button"
                >
                  + Image Block
                </button>

                <button
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg hover:shadow-blue-100"
                  onClick={() => addComponent('services')}
                  type="button"
                >
                  + Services Block
                </button>

                <button
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg hover:shadow-blue-100"
                  onClick={() => addComponent('testimonials')}
                  type="button"
                >
                  + Testimonials Block
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h2 className="text-lg font-bold text-slate-950">Prompt Builder</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Describe the page you want. VibeBuilder will generate editable layoutJson.
              </p>

              <textarea
                className="mt-3 min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-inner outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Example: Make me a portfolio homepage with hero, about section, and contact CTA"
                value={promptText}
                onChange={(event) => setPromptText(event.target.value)}
              />

              <button
                className="mt-3 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isGeneratingFromPrompt}
                onClick={handleGenerateFromPrompt}
                type="button"
              >
                {isGeneratingFromPrompt ? 'Generating...' : 'Generate Layout'}
              </button>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Generated blocks are editable. Click Save layoutJson to persist them in SELISE Data
                Gateway.
              </p>
            </div>
          </aside>

          <main className="rounded-[2rem] border border-white/80 bg-white/95 p-5 shadow-xl shadow-slate-200/80 backdrop-blur">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Builder Canvas</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Click a block to edit it. Drag blocks to reorder them.
                </p>
              </div>

              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                {components.length} blocks
              </span>
            </div>

            <div className="space-y-4">
              {components.map((component, index) => (
                <div
                  key={component.id}
                  draggable
                  onClick={() => setSelectedComponentId(component.id)}
                  onDragStart={() => setDraggedComponentId(component.id)}
                  onDragOver={allowDrop}
                  onDrop={() => handleDropOnComponent(component.id)}
                  className={`rounded-[1.75rem] border p-4 shadow-sm transition ${
                    selectedComponentId === component.id
                      ? 'border-blue-400 bg-blue-50 shadow-xl shadow-blue-100'
                      : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {component.type} block
                      </p>
                      <p className="mt-1 text-sm text-slate-500">Position {index + 1}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg"
                        onClick={(event) => {
                          event.stopPropagation();
                          moveComponent(component.id, 'up');
                        }}
                        type="button"
                      >
                        ↑
                      </button>

                      <button
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg"
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

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <LiveRenderer layoutJson={stringifyLayout([component])} />
                  </div>
                </div>
              ))}

              {components.length === 0 && (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500 shadow-sm backdrop-blur">
                  No blocks yet. Add a block from the Component Library or generate a layout from a
                  prompt.
                </div>
              )}
            </div>
          </main>

          <aside className="space-y-4 rounded-[2rem] border border-white/80 bg-white/95 p-5 shadow-xl shadow-slate-200/80 backdrop-blur xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-auto">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Properties Panel</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Edit the selected block. Changes update the preview immediately.
              </p>
            </div>

            {!selectedComponent && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
                Select a block from the canvas to edit its content.
              </div>
            )}

            {selectedComponent && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-blue-700">
                    Selected: {selectedComponent.type}
                  </p>
                  <p className="mt-1 break-all text-xs text-blue-600">{selectedComponent.id}</p>
                </div>

                {(selectedComponent.type === 'hero' || selectedComponent.type === 'cta') && (
                  <>
                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Title</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.title ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('title', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Subtitle</span>
                      <textarea
                        className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.subtitle ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('subtitle', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Button Text</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.buttonText ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('buttonText', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Button Link</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        placeholder="#, /site/agency-site/contact, mailto:hello@example.com"
                        value={selectedComponent.props.buttonLink ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('buttonLink', event.target.value)
                        }
                      />
                      <span className="block text-xs leading-5 text-slate-500">
                        Use #, a public page path, mailto:, tel:, or a full https:// link.
                      </span>
                    </label>
                  </>
                )}

                {selectedComponent.type === 'text' && (
                  <>
                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Heading</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.heading ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('heading', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Body</span>
                      <textarea
                        className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.body ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('body', event.target.value)
                        }
                      />
                    </label>
                  </>
                )}

                {selectedComponent.type === 'image' && (
                  <>
                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Image URL</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.imageUrl ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('imageUrl', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Alt Text</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.altText ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('altText', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Caption</span>
                      <textarea
                        className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
                      <span className="text-sm font-semibold text-slate-700">Section Title</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.title ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('title', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Section Subtitle</span>
                      <textarea
                        className="min-h-20 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.subtitle ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('subtitle', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Service 1 Title</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.serviceOneTitle ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('serviceOneTitle', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Service 1 Body</span>
                      <textarea
                        className="min-h-20 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.serviceOneBody ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('serviceOneBody', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Service 2 Title</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.serviceTwoTitle ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('serviceTwoTitle', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Service 2 Body</span>
                      <textarea
                        className="min-h-20 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.serviceTwoBody ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('serviceTwoBody', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Service 3 Title</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.serviceThreeTitle ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('serviceThreeTitle', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Service 3 Body</span>
                      <textarea
                        className="min-h-20 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
                      <span className="text-sm font-semibold text-slate-700">Section Title</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.title ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('title', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Section Subtitle</span>
                      <textarea
                        className="min-h-20 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.subtitle ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('subtitle', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Testimonial 1 Name</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.testimonialOneName ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('testimonialOneName', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">
                        Testimonial 1 Quote
                      </span>
                      <textarea
                        className="min-h-20 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.testimonialOneQuote ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('testimonialOneQuote', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Testimonial 2 Name</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.testimonialTwoName ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('testimonialTwoName', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">
                        Testimonial 2 Quote
                      </span>
                      <textarea
                        className="min-h-20 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.testimonialTwoQuote ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('testimonialTwoQuote', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Testimonial 3 Name</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.testimonialThreeName ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('testimonialThreeName', event.target.value)
                        }
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">
                        Testimonial 3 Quote
                      </span>
                      <textarea
                        className="min-h-20 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        value={selectedComponent.props.testimonialThreeQuote ?? ''}
                        onChange={(event) =>
                          updateSelectedComponentProp('testimonialThreeQuote', event.target.value)
                        }
                      />
                    </label>
                  </>
                )}

                <button
                  className="w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-lg"
                  onClick={duplicateSelectedComponent}
                  type="button"
                >
                  Duplicate Selected Block
                </button>

                <button
                  className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-lg"
                  onClick={deleteSelectedComponent}
                  type="button"
                >
                  Delete Selected Block
                </button>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 shadow-sm">
              <h3 className="font-semibold text-white">Stored layoutJson Preview</h3>
              <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100">
                {JSON.stringify(JSON.parse(draftLayoutJson), null, 2)}
              </pre>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};