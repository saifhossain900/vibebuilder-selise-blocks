import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAccount } from '@/modules/profile/hooks/use-account';
import {
  createWebsitePage,
  createWebsiteProject,
  deleteWebsitePage,
  getWebsitePages,
  getWebsitePagesByProject,
  getWebsiteProjects,
  updateWebsitePage,
  updateWebsiteProject,
} from '../../services/vibebuilder.service';
import { WebsitePage, WebsiteProject } from '../../types/vibebuilder.types';

type PageTemplateId = 'default' | 'business' | 'portfolio' | 'services' | 'contact';

const pageTemplateOptions: {
  id: PageTemplateId;
  label: string;
  description: string;
}[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Hero + Text',
  },
  {
    id: 'business',
    label: 'Business Landing',
    description: 'Hero + Services + Testimonials + CTA',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    description: 'Hero + Image + Text + CTA',
  },
  {
    id: 'services',
    label: 'Services Page',
    description: 'Hero + Services + CTA',
  },
  {
    id: 'contact',
    label: 'Contact Page',
    description: 'Hero + Text + CTA',
  },
];

const getComponentCount = (layoutJson: string): number => {
  try {
    const parsedLayout = JSON.parse(layoutJson) as {
      components?: unknown[];
    };

    return Array.isArray(parsedLayout.components) ? parsedLayout.components.length : 0;
  } catch {
    return 0;
  }
};

const createSlug = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const waitForDataGatewaySync = async () => {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 900);
  });
};

const createTemplateLayoutJson = (pageName: string, templateId: PageTemplateId): string => {
  const createdAt = Date.now();

  const heroBlock = {
    id: `hero_${createdAt}`,
    type: 'hero',
    props: {
      title: pageName,
      subtitle: `This is the ${pageName} page built with VibeBuilder.`,
      buttonText: 'Get Started',
      buttonLink: '#',
    },
  };

  const textBlock = {
    id: `text_${createdAt}`,
    type: 'text',
    props: {
      heading: `About ${pageName}`,
      body: 'Edit this content in the VibeBuilder editor and save it to SELISE Data Gateway.',
    },
  };

  const servicesBlock = {
    id: `services_${createdAt}`,
    type: 'services',
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

  const imageBlock = {
    id: `image_${createdAt}`,
    type: 'image',
    props: {
      imageUrl:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
      altText: 'Workspace desk with laptop',
      caption: 'A professional image section for your website.',
    },
  };

  const testimonialsBlock = {
    id: `testimonials_${createdAt}`,
    type: 'testimonials',
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

  const ctaBlock = {
    id: `cta_${createdAt}`,
    type: 'cta',
    props: {
      title: 'Ready to take action?',
      subtitle: 'Add a short message and guide visitors to the next step.',
      buttonText: 'Contact Now',
      buttonLink: '#',
    },
  };

  if (templateId === 'business') {
    return JSON.stringify({
      components: [heroBlock, servicesBlock, testimonialsBlock, ctaBlock],
    });
  }

  if (templateId === 'portfolio') {
    return JSON.stringify({
      components: [heroBlock, imageBlock, textBlock, ctaBlock],
    });
  }

  if (templateId === 'services') {
    return JSON.stringify({
      components: [heroBlock, servicesBlock, ctaBlock],
    });
  }

  if (templateId === 'contact') {
    return JSON.stringify({
      components: [
        heroBlock,
        {
          ...textBlock,
          props: {
            heading: `Contact ${pageName}`,
            body: 'Add your contact details, business hours, location, email address, phone number, or inquiry instructions here.',
          },
        },
        ctaBlock,
      ],
    });
  }

  return JSON.stringify({
    components: [heroBlock, textBlock],
  });
};

const createDefaultLayoutJson = (pageName: string): string => {
  return createTemplateLayoutJson(pageName, 'default');
};

export const VibeBuilderDashboardPage = () => {
  const { data: account, isLoading: isAccountLoading } = useGetAccount();

  const [projects, setProjects] = useState<WebsiteProject[]>([]);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const [newWebsiteName, setNewWebsiteName] = useState('');
  const [newWebsiteDescription, setNewWebsiteDescription] = useState('');
  const [newPageName, setNewPageName] = useState('');
  const [newPageTemplate, setNewPageTemplate] = useState<PageTemplateId>('default');

  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingWebsite, setIsCreatingWebsite] = useState(false);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [isEditingProjectSettings, setIsEditingProjectSettings] = useState(false);
  const [isSavingProjectSettings, setIsSavingProjectSettings] = useState(false);
  const [isSavingPageSettings, setIsSavingPageSettings] = useState(false);
  const [deletingPageId, setDeletingPageId] = useState('');

  const [settingsSiteName, setSettingsSiteName] = useState('');
  const [settingsDescription, setSettingsDescription] = useState('');
  const [settingsIsPublished, setSettingsIsPublished] = useState(true);

  const [editingPageId, setEditingPageId] = useState('');
  const [settingsPageName, setSettingsPageName] = useState('');
  const [settingsPageSlug, setSettingsPageSlug] = useState('');
  const [settingsPageIsHome, setSettingsPageIsHome] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const currentUserId = account?.itemId ?? '';

  const syncProjectPagesIntoState = (projectId: string, freshProjectPages: WebsitePage[]) => {
    setPages((currentPages) => {
      const otherPages = currentPages.filter((page) => {
        return page.projectId !== projectId;
      });

      return [...otherPages, ...freshProjectPages];
    });
  };

  const fetchPagesForProject = async (projectId: string): Promise<WebsitePage[]> => {
    if (!projectId || !currentUserId) {
      return [];
    }

    const projectPageResult = await getWebsitePagesByProject(projectId);
    const projectPages = projectPageResult.getWebsitePages.items ?? [];

    return projectPages
      .filter((page) => {
        return page.projectId === projectId && page.ownerUserId === currentUserId;
      })
      .sort((firstPage, secondPage) => firstPage.displayOrder - secondPage.displayOrder);
  };

  const refreshPagesForProject = async (projectId: string): Promise<WebsitePage[]> => {
    const freshProjectPages = await fetchPagesForProject(projectId);
    syncProjectPagesIntoState(projectId, freshProjectPages);
    return freshProjectPages;
  };

  const loadVibeBuilderData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const [projectResult, pageResult] = await Promise.all([
        getWebsiteProjects(),
        getWebsitePages(),
      ]);

      const allProjects = projectResult.getWebsiteProjects.items ?? [];
      const allPages = pageResult.getWebsitePages.items ?? [];

      const myProjects = currentUserId
        ? allProjects.filter((project) => project.ownerUserId === currentUserId)
        : [];

      const myProjectIds = new Set(myProjects.map((project) => project.ItemId));

      const myPages = allPages.filter((page) => {
        return page.ownerUserId === currentUserId && myProjectIds.has(page.projectId);
      });

      setProjects(myProjects);
      setPages(myPages);

      setSelectedProjectId((currentSelectedProjectId) => {
        if (
          currentSelectedProjectId &&
          myProjects.some((project) => project.ItemId === currentSelectedProjectId)
        ) {
          return currentSelectedProjectId;
        }

        return myProjects[0]?.ItemId ?? '';
      });
    } catch (error) {
      console.error('Failed to load VibeBuilder data:', error);
      setErrorMessage('Could not load VibeBuilder data from SELISE Data Gateway.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUserId) {
      setIsLoading(false);
      return;
    }

    loadVibeBuilderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId || !selectedProjectId) {
      return;
    }

    refreshPagesForProject(selectedProjectId).catch((error) => {
      console.warn('Could not refresh selected project pages directly:', error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, selectedProjectId]);

  const selectedProject = useMemo(() => {
    return projects.find((project) => project.ItemId === selectedProjectId);
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (!selectedProject) {
      setSettingsSiteName('');
      setSettingsDescription('');
      setSettingsIsPublished(true);
      setEditingPageId('');
      return;
    }

    setSettingsSiteName(selectedProject.siteName);
    setSettingsDescription(selectedProject.description ?? '');
    setSettingsIsPublished(selectedProject.isPublished);
    setIsEditingProjectSettings(false);
    setEditingPageId('');
  }, [selectedProject]);

  const selectedProjectPages = useMemo(() => {
    if (!selectedProject) {
      return [];
    }

    return [...pages]
      .filter((page) => page.projectId === selectedProject.ItemId)
      .sort((firstPage, secondPage) => firstPage.displayOrder - secondPage.displayOrder);
  }, [pages, selectedProject]);

  const selectedProjectHomePage = useMemo(() => {
    return selectedProjectPages.find((page) => page.isHomePage);
  }, [selectedProjectPages]);

  const totalLayoutComponents = useMemo(() => {
    return pages.reduce((total, page) => total + getComponentCount(page.layoutJson), 0);
  }, [pages]);

  const handleCreateWebsite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUserId) {
      setErrorMessage('Could not detect logged-in SELISE user.');
      return;
    }

    const siteName = newWebsiteName.trim();
    const siteSlug = createSlug(siteName);

    if (!siteName || !siteSlug) {
      setErrorMessage('Please enter a valid website name.');
      return;
    }

    const slugAlreadyExists = projects.some((project) => project.siteSlug === siteSlug);

    if (slugAlreadyExists) {
      setErrorMessage('You already have a website with this slug. Use another name.');
      return;
    }

    try {
      setIsCreatingWebsite(true);
      setErrorMessage('');
      setSuccessMessage('');

      await createWebsiteProject({
        ownerUserId: currentUserId,
        siteName,
        siteSlug,
        description:
          newWebsiteDescription.trim() ||
          `A website created with VibeBuilder by ${account?.firstName || 'user'}.`,
        isPublished: true,
      });

      await waitForDataGatewaySync();

      const projectResult = await getWebsiteProjects();
      const createdProject = (projectResult.getWebsiteProjects.items ?? [])
        .filter((project) => project.ownerUserId === currentUserId)
        .find((project) => project.siteSlug === siteSlug);

      if (createdProject) {
        await createWebsitePage({
          projectId: createdProject.ItemId,
          ownerUserId: currentUserId,
          pageName: 'Home',
          pageSlug: 'home',
          layoutJson: createDefaultLayoutJson(siteName),
          displayOrder: 1,
          isHomePage: true,
        });

        setSelectedProjectId(createdProject.ItemId);

        await waitForDataGatewaySync();
        await refreshPagesForProject(createdProject.ItemId);
      }

      setNewWebsiteName('');
      setNewWebsiteDescription('');
      setSuccessMessage(`${siteName} website created with a Home page.`);

      await loadVibeBuilderData();

      if (createdProject) {
        await refreshPagesForProject(createdProject.ItemId);
      }
    } catch (error) {
      console.error('Failed to create website:', error);
      setErrorMessage('Could not create website in SELISE Data Gateway.');
    } finally {
      setIsCreatingWebsite(false);
    }
  };

  const handleCreatePage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUserId) {
      setErrorMessage('Could not detect logged-in SELISE user.');
      return;
    }

    if (!selectedProject) {
      setErrorMessage('Select or create a website before adding pages.');
      return;
    }

    const pageName = newPageName.trim();
    const pageSlug = createSlug(pageName);

    if (!pageName || !pageSlug) {
      setErrorMessage('Please enter a valid page name.');
      return;
    }

    let latestProjectPages = selectedProjectPages;

    try {
      latestProjectPages = await refreshPagesForProject(selectedProject.ItemId);
    } catch (error) {
      console.warn('Could not pre-check latest project pages:', error);
    }

    const slugAlreadyExists = latestProjectPages.some((page) => page.pageSlug === pageSlug);

    if (slugAlreadyExists) {
      setErrorMessage('This website already has a page with this slug. Use another page name.');
      return;
    }

    try {
      setIsCreatingPage(true);
      setErrorMessage('');
      setSuccessMessage('');

      const selectedTemplate = pageTemplateOptions.find((template) => template.id === newPageTemplate);

      await createWebsitePage({
        projectId: selectedProject.ItemId,
        ownerUserId: currentUserId,
        pageName,
        pageSlug,
        layoutJson: createTemplateLayoutJson(pageName, newPageTemplate),
        displayOrder: latestProjectPages.length + 1,
        isHomePage: false,
      });

      setNewPageName('');
      setNewPageTemplate('default');
      setSuccessMessage(
        `${pageName} page created in ${selectedProject.siteName}${
          selectedTemplate && selectedTemplate.id !== 'default'
            ? ` using ${selectedTemplate.label} template`
            : ''
        }.`
      );

      await waitForDataGatewaySync();
      await refreshPagesForProject(selectedProject.ItemId);

      await waitForDataGatewaySync();
      await refreshPagesForProject(selectedProject.ItemId);
    } catch (error) {
      console.error('Failed to create page:', error);
      setErrorMessage('Could not create page in SELISE Data Gateway.');
    } finally {
      setIsCreatingPage(false);
    }
  };

  const handleSaveProjectSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProject) {
      setErrorMessage('Select a website before editing settings.');
      return;
    }

    if (selectedProject.ownerUserId !== currentUserId) {
      setErrorMessage('You cannot edit a website that does not belong to your workspace.');
      return;
    }

    const siteName = settingsSiteName.trim();
    const siteSlug = createSlug(siteName);

    if (!siteName || !siteSlug) {
      setErrorMessage('Please enter a valid website name.');
      return;
    }

    const slugAlreadyExists = projects.some((project) => {
      return project.ItemId !== selectedProject.ItemId && project.siteSlug === siteSlug;
    });

    if (slugAlreadyExists) {
      setErrorMessage('Another one of your websites already uses this slug.');
      return;
    }

    try {
      setIsSavingProjectSettings(true);
      setErrorMessage('');
      setSuccessMessage('');

      await updateWebsiteProject(selectedProject.ItemId, {
        siteName,
        siteSlug,
        description: settingsDescription.trim(),
        isPublished: settingsIsPublished,
        updatedAt: new Date().toISOString(),
      });

      setSuccessMessage(`${siteName} settings updated in SELISE Data Gateway.`);
      setIsEditingProjectSettings(false);

      await waitForDataGatewaySync();
      await loadVibeBuilderData();
      await refreshPagesForProject(selectedProject.ItemId);
    } catch (error) {
      console.error('Failed to update website settings:', error);
      setErrorMessage('Could not update website settings in SELISE Data Gateway.');
    } finally {
      setIsSavingProjectSettings(false);
    }
  };

  const handleCancelProjectSettings = () => {
    if (!selectedProject) {
      return;
    }

    setSettingsSiteName(selectedProject.siteName);
    setSettingsDescription(selectedProject.description ?? '');
    setSettingsIsPublished(selectedProject.isPublished);
    setIsEditingProjectSettings(false);
    setErrorMessage('');
  };

  const startPageSettings = (page: WebsitePage) => {
    setEditingPageId(page.ItemId);
    setSettingsPageName(page.pageName);
    setSettingsPageSlug(page.pageSlug);
    setSettingsPageIsHome(page.isHomePage);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const cancelPageSettings = () => {
    setEditingPageId('');
    setSettingsPageName('');
    setSettingsPageSlug('');
    setSettingsPageIsHome(false);
    setErrorMessage('');
  };

  const handleSavePageSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProject) {
      setErrorMessage('Select a website before editing page settings.');
      return;
    }

    const editingPage = selectedProjectPages.find((page) => page.ItemId === editingPageId);

    if (!editingPage) {
      setErrorMessage('Select a page before saving page settings.');
      return;
    }

    if (editingPage.ownerUserId !== currentUserId) {
      setErrorMessage('You cannot edit a page that does not belong to your workspace.');
      return;
    }

    const pageName = settingsPageName.trim();
    const pageSlug = createSlug(settingsPageSlug || settingsPageName);

    if (!pageName || !pageSlug) {
      setErrorMessage('Please enter a valid page name and slug.');
      return;
    }

    let latestProjectPages = selectedProjectPages;

    try {
      latestProjectPages = await refreshPagesForProject(selectedProject.ItemId);
    } catch (error) {
      console.warn('Could not pre-check latest project pages before saving page settings:', error);
    }

    const slugAlreadyExists = latestProjectPages.some((page) => {
      return page.ItemId !== editingPage.ItemId && page.pageSlug === pageSlug;
    });

    if (slugAlreadyExists) {
      setErrorMessage('This website already has another page with this slug.');
      return;
    }

    if (editingPage.isHomePage && !settingsPageIsHome) {
      setErrorMessage('A website must have a Home page. Set another page as Home first.');
      return;
    }

    try {
      setIsSavingPageSettings(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (settingsPageIsHome) {
        const oldHomePages = latestProjectPages.filter((page) => {
          return page.ItemId !== editingPage.ItemId && page.isHomePage;
        });

        await Promise.all(
          oldHomePages.map((page) => {
            return updateWebsitePage(page.ItemId, {
              isHomePage: false,
            });
          })
        );
      }

      await updateWebsitePage(editingPage.ItemId, {
        pageName,
        pageSlug,
        isHomePage: settingsPageIsHome,
      });

      setSuccessMessage(`${pageName} page settings updated in SELISE Data Gateway.`);
      setEditingPageId('');

      await waitForDataGatewaySync();
      await refreshPagesForProject(selectedProject.ItemId);
    } catch (error) {
      console.error('Failed to update page settings:', error);
      setErrorMessage('Could not update page settings in SELISE Data Gateway.');
    } finally {
      setIsSavingPageSettings(false);
    }
  };

  const copyPublicPageLink = async (page: WebsitePage) => {
    if (!selectedProject) {
      setErrorMessage('Select a website before copying a public page link.');
      return;
    }

    const publicPageUrl = `${window.location.origin}/site/${selectedProject.siteSlug}/${page.pageSlug}`;

    try {
      await navigator.clipboard.writeText(publicPageUrl);
      setErrorMessage('');
      setSuccessMessage(`Copied public link for ${page.pageName}.`);
    } catch (error) {
      console.error('Failed to copy public page link:', error);
      setErrorMessage(
        'Could not copy the link automatically. Open View Page and copy the browser URL.'
      );
    }
  };

  const handleDeletePage = async (page: WebsitePage) => {
    if (!selectedProject) {
      setErrorMessage('Select a website before deleting a page.');
      return;
    }

    if (page.ownerUserId !== currentUserId) {
      setErrorMessage('You cannot delete a page that does not belong to your workspace.');
      return;
    }

    if (page.isHomePage) {
      setErrorMessage('Home page cannot be deleted.');
      return;
    }

    try {
      setDeletingPageId(page.ItemId);
      setErrorMessage('');
      setSuccessMessage('');

      await deleteWebsitePage(page.ItemId);

      setSuccessMessage(`${page.pageName} page deleted from SELISE Data Gateway.`);

      await waitForDataGatewaySync();
      await refreshPagesForProject(selectedProject.ItemId);

      await waitForDataGatewaySync();
      await refreshPagesForProject(selectedProject.ItemId);
    } catch (error) {
      console.error('Failed to delete page:', error);
      setErrorMessage('Could not delete page from SELISE Data Gateway.');
    } finally {
      setDeletingPageId('');
    }
  };

  if (isAccountLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_32%,#eef2ff_62%,#f8fafc_100%)] px-6 py-10">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/80 bg-white/90 p-8 text-slate-700 shadow-xl shadow-slate-200/80 backdrop-blur">
          Loading SELISE account...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_32%,#eef2ff_62%,#f8fafc_100%)]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-400/30 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-2xl shadow-blue-950/20 md:p-8">
          <div className="absolute inset-0 opacity-80">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.20),transparent_45%,rgba(14,165,233,0.12))]" />
          </div>

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100 shadow-sm">
                SELISE Blocks Website Builder
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
                VibeBuilder
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Create multi-page websites, generate editable layouts, save layoutJson, and publish
                live pages using SELISE IAM and SELISE Data Gateway.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-200">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 shadow-sm backdrop-blur">
                  SELISE IAM
                </span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 shadow-sm backdrop-blur">
                  Data Gateway
                </span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 shadow-sm backdrop-blur">
                  layoutJson
                </span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 shadow-sm backdrop-blur">
                  Public Live Sites
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-300 shadow-xl backdrop-blur">
              <p className="font-semibold text-white">Workspace</p>
              <p className="mt-2 break-all text-xs leading-5">
                {currentUserId || 'SELISE account not detected'}
              </p>
              <p className="mt-3 text-xs text-slate-400">
                All projects shown here belong to your logged-in SELISE IAM workspace.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-xl shadow-slate-200/80 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-100">
            <p className="text-sm font-semibold text-slate-500">Website Projects</p>
            <p className="mt-3 text-4xl font-bold text-slate-950">{projects.length}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Websites owned by your SELISE IAM account.
            </p>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-xl shadow-slate-200/80 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-100">
            <p className="text-sm font-semibold text-slate-500">Total Pages</p>
            <p className="mt-3 text-4xl font-bold text-slate-950">{pages.length}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Pages stored as WebsitePage records.
            </p>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-xl shadow-slate-200/80 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-100">
            <p className="text-sm font-semibold text-slate-500">Layout Blocks</p>
            <p className="mt-3 text-4xl font-bold text-slate-950">{totalLayoutComponents}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Serialized components saved in layoutJson.
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-3xl border border-blue-200 bg-blue-50/90 p-5 text-blue-700 shadow-xl shadow-blue-100 backdrop-blur">
            Loading your VibeBuilder workspace from SELISE Data Gateway...
          </div>
        )}

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

        {!isLoading && currentUserId && (
          <section className="rounded-[2rem] border border-white/80 bg-white/95 p-5 shadow-xl shadow-slate-200/80 backdrop-blur md:p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                  Create Website
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  Start a new website project
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Each website becomes a WebsiteProject record and receives an automatic Home page
                  in SELISE Data Gateway.
                </p>
              </div>
            </div>

            <form className="mt-5 space-y-3" onSubmit={handleCreateWebsite}>
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-inner outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Website name, e.g. Agency Site"
                  value={newWebsiteName}
                  onChange={(event) => setNewWebsiteName(event.target.value)}
                />

                <button
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isCreatingWebsite}
                  type="submit"
                >
                  {isCreatingWebsite ? 'Creating...' : 'Create Website'}
                </button>
              </div>

              <textarea
                className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-inner outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Website description. You can write a longer description here."
                value={newWebsiteDescription}
                onChange={(event) => setNewWebsiteDescription(event.target.value)}
              />
            </form>
          </section>
        )}

        {!isLoading && projects.length > 0 && (
          <section className="rounded-[2rem] border border-white/80 bg-white/95 p-5 shadow-xl shadow-slate-200/80 backdrop-blur md:p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                  Workspace Sites
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  My Websites
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Select a website to manage its pages and public route.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const projectPageCount = pages.filter(
                  (page) => page.projectId === project.ItemId
                ).length;
                const isSelected = project.ItemId === selectedProjectId;

                return (
                  <button
                    key={project.ItemId}
                    className={`group rounded-3xl border p-5 text-left transition ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50 shadow-xl shadow-blue-100'
                        : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100'
                    }`}
                    onClick={() => {
                      setSelectedProjectId(project.ItemId);
                      setEditingPageId('');
                      setErrorMessage('');
                    }}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold text-slate-950">
                          {project.siteName}
                        </h3>
                        <p className="mt-1 truncate text-sm text-slate-500">/{project.siteSlug}</p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                          project.isPublished
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {project.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                      {project.description || 'No website description added yet.'}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                      <p className="text-sm text-slate-600">
                        Pages: <span className="font-bold text-slate-950">{projectPageCount}</span>
                      </p>
                      <span className="text-sm font-semibold text-blue-600 opacity-80 transition group-hover:translate-x-0.5 group-hover:opacity-100">
                        Manage →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {!isLoading && selectedProject && (
          <section className="rounded-[2rem] border border-white/80 bg-white/95 p-5 shadow-xl shadow-slate-200/80 backdrop-blur md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                  Selected Website
                </p>
                <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                  {selectedProject.siteName}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  {selectedProject.description || 'No description added.'}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-500">/{selectedProject.siteSlug}</p>

                {selectedProject.isPublished ? (
                  <Link
                    className="mt-4 inline-flex rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl"
                    to={`/site/${selectedProject.siteSlug}/${
                      selectedProjectHomePage?.pageSlug ?? 'home'
                    }`}
                  >
                    View public website
                  </Link>
                ) : (
                  <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    This website is currently draft. Public route will show website not found.
                  </p>
                )}
              </div>

              <div className="flex flex-col items-start gap-2 md:items-end">
                <div
                  className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${
                    selectedProject.isPublished
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {selectedProject.isPublished ? 'Published' : 'Draft'}
                </div>

                <button
                  className="rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-lg"
                  onClick={() => setIsEditingProjectSettings((current) => !current)}
                  type="button"
                >
                  {isEditingProjectSettings ? 'Close Settings' : 'Edit Website Settings'}
                </button>
              </div>
            </div>

            {isEditingProjectSettings && (
              <form
                className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-slate-50/90 p-5 shadow-inner"
                onSubmit={handleSaveProjectSettings}
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Website Settings</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Update the website name, description, slug, and publish status.
                  </p>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Website Name</span>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    value={settingsSiteName}
                    onChange={(event) => setSettingsSiteName(event.target.value)}
                  />
                  <span className="block text-xs text-slate-500">
                    New public slug preview: /{createSlug(settingsSiteName) || 'website-slug'}
                  </span>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Website Description</span>
                  <textarea
                    className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    value={settingsDescription}
                    onChange={(event) => setSettingsDescription(event.target.value)}
                  />
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
                  <input
                    checked={settingsIsPublished}
                    className="mt-1"
                    onChange={(event) => setSettingsIsPublished(event.target.checked)}
                    type="checkbox"
                  />
                  <span>
                    <span className="font-semibold text-slate-800">Published</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Published websites are visible through /site/slug/page. Draft websites stay
                      hidden from the public route.
                    </span>
                  </span>
                </label>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl disabled:opacity-60"
                    disabled={isSavingProjectSettings}
                    type="submit"
                  >
                    {isSavingProjectSettings ? 'Saving...' : 'Save Settings'}
                  </button>

                  <button
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg"
                    onClick={handleCancelProjectSettings}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <form
              className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 shadow-inner md:grid-cols-[minmax(0,1fr)_260px_auto]"
              onSubmit={handleCreatePage}
            >
              <input
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder="New page name, e.g. Portfolio"
                value={newPageName}
                onChange={(event) => setNewPageName(event.target.value)}
              />

              <select
                aria-label="Choose page starter template"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                value={newPageTemplate}
                onChange={(event) => setNewPageTemplate(event.target.value as PageTemplateId)}
              >
                {pageTemplateOptions.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label}
                  </option>
                ))}
              </select>

              <button
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isCreatingPage}
                type="submit"
              >
                {isCreatingPage ? 'Creating...' : 'Create Page'}
              </button>

              <p className="text-xs leading-5 text-slate-500 md:col-span-3">
                Starter templates are optional. Choose Default for the normal simple page, or select
                a richer starter layout to begin faster.
              </p>

              <div className="grid gap-2 md:col-span-3 md:grid-cols-2 lg:grid-cols-5">
                {pageTemplateOptions.map((template) => (
                  <button
                    key={template.id}
                    className={`rounded-2xl border px-3 py-3 text-left text-xs shadow-sm transition ${
                      newPageTemplate === template.id
                        ? 'border-blue-300 bg-blue-50 text-blue-700 shadow-blue-100'
                        : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg hover:shadow-blue-100'
                    }`}
                    onClick={() => setNewPageTemplate(template.id)}
                    type="button"
                  >
                    <span className="block font-bold">{template.label}</span>
                    <span className="mt-1 block leading-5">{template.description}</span>
                  </button>
                ))}
              </div>
            </form>

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {selectedProjectPages.map((page) => (
                <div
                  key={page.ItemId}
                  className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-slate-950">{page.pageName}</h3>
                      <p className="mt-1 truncate text-sm text-slate-500">/{page.pageSlug}</p>
                    </div>

                    {page.isHomePage && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
                        Home
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-sm text-slate-600">
                    Components:{' '}
                    <span className="font-bold text-slate-950">
                      {getComponentCount(page.layoutJson)}
                    </span>
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      className="inline-flex rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
                      to={`/vibebuilder/builder/${page.projectId}/${page.ItemId}`}
                    >
                      Open Builder
                    </Link>

                    <Link
                      className="inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg"
                      to={`/site/${selectedProject.siteSlug}/${page.pageSlug}`}
                    >
                      View Page
                    </Link>

                    <button
                      className="inline-flex rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-lg"
                      onClick={() => copyPublicPageLink(page)}
                      type="button"
                    >
                      Copy Link
                    </button>

                    <button
                      className="inline-flex rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-lg"
                      onClick={() => startPageSettings(page)}
                      type="button"
                    >
                      Settings
                    </button>

                    <button
                      className="inline-flex rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={page.isHomePage || deletingPageId === page.ItemId}
                      onClick={() => handleDeletePage(page)}
                      type="button"
                    >
                      {deletingPageId === page.ItemId ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>

                  {editingPageId === page.ItemId && (
                    <form
                      className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-inner"
                      onSubmit={handleSavePageSettings}
                    >
                      <div>
                        <h4 className="font-bold text-slate-950">Page Settings</h4>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Rename this page, update its slug, or set it as the Home page.
                        </p>
                      </div>

                      <label className="block space-y-1">
                        <span className="text-xs font-semibold text-slate-700">Page Name</span>
                        <input
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                          value={settingsPageName}
                          onChange={(event) => {
                            setSettingsPageName(event.target.value);
                            setSettingsPageSlug(createSlug(event.target.value));
                          }}
                        />
                      </label>

                      <label className="block space-y-1">
                        <span className="text-xs font-semibold text-slate-700">Page Slug</span>
                        <input
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                          value={settingsPageSlug}
                          onChange={(event) => setSettingsPageSlug(createSlug(event.target.value))}
                        />
                        <span className="block text-xs leading-5 text-slate-500">
                          Public page URL: /site/{selectedProject.siteSlug}/
                          {createSlug(settingsPageSlug) || 'page-slug'}
                        </span>
                      </label>

                      <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
                        <input
                          checked={settingsPageIsHome}
                          className="mt-1"
                          onChange={(event) => setSettingsPageIsHome(event.target.checked)}
                          type="checkbox"
                        />
                        <span>
                          <span className="font-semibold text-slate-800">Set as Home page</span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            Only one page should be Home inside each website.
                          </span>
                        </span>
                      </label>

                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg disabled:opacity-60"
                          disabled={isSavingPageSettings}
                          type="submit"
                        >
                          {isSavingPageSettings ? 'Saving...' : 'Save Page'}
                        </button>

                        <button
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg"
                          onClick={cancelPageSettings}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}

              {selectedProjectPages.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-5 text-sm text-slate-500 shadow-sm backdrop-blur">
                  No pages found for this website yet.
                </div>
              )}
            </div>
          </section>
        )}

        {!isLoading && currentUserId && projects.length === 0 && (
          <div className="rounded-3xl border border-white/80 bg-white/90 p-8 text-center text-slate-600 shadow-xl shadow-slate-200/80 backdrop-blur">
            <h2 className="text-xl font-bold text-slate-950">Create your first website</h2>
            <p className="mt-2 text-sm text-slate-500">
              You do not have a website yet. Use the create website section above to start.
            </p>
          </div>
        )}

        {!currentUserId && (
          <div className="rounded-3xl border border-red-200 bg-red-50/90 p-5 text-red-700 shadow-xl shadow-red-100 backdrop-blur">
            Could not detect your SELISE account. Please log in again.
          </div>
        )}
      </div>
    </div>
  );
};