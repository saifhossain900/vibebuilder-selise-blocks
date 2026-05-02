import { LayoutComponent } from '../types/vibebuilder.types';

const createId = (prefix: string) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const imageLibrary = {
  portfolio:
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
  restaurant:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop',
  agency:
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format&fit=crop',
  shop:
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
  default:
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop',
};

const getPromptTheme = (prompt: string) => {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('personal')) {
    return {
      imageUrl: imageLibrary.portfolio,
      imageCaption: 'A clean workspace image for a professional portfolio.',
      imageAltText: 'Laptop workspace for portfolio website',
      title: 'Creative Portfolio',
      subtitle: 'Showcase your work, skills, projects, and contact information in one clean website.',
      sectionHeading: 'About Me',
      sectionBody:
        'I build professional digital experiences with a focus on clarity, creativity, and useful solutions. This section can be edited to describe background, skills, achievements, and goals.',
      ctaTitle: 'Let’s Work Together',
      ctaSubtitle: 'Reach out to discuss projects, collaborations, or opportunities.',
      buttonText: 'Contact Me',
    };
  }

  if (
    lowerPrompt.includes('restaurant') ||
    lowerPrompt.includes('food') ||
    lowerPrompt.includes('cafe')
  ) {
    return {
      imageUrl: imageLibrary.restaurant,
      imageCaption: 'A warm restaurant section designed to attract visitors.',
      imageAltText: 'Restaurant interior with food and seating',
      title: 'Fresh Taste, Great Experience',
      subtitle: 'A modern food website for menu highlights, atmosphere, and customer trust.',
      sectionHeading: 'Our Story',
      sectionBody:
        'We focus on quality, flavor, and a welcoming experience for every customer. Use this section to describe your menu, restaurant story, and what makes your food special.',
      ctaTitle: 'Reserve or Order Today',
      ctaSubtitle: 'Make your next meal simple, fresh, and memorable.',
      buttonText: 'Order Now',
    };
  }

  if (
    lowerPrompt.includes('agency') ||
    lowerPrompt.includes('business') ||
    lowerPrompt.includes('startup')
  ) {
    return {
      imageUrl: imageLibrary.agency,
      imageCaption: 'A professional agency image for business credibility.',
      imageAltText: 'Business team working together',
      title: 'Grow Your Business with Confidence',
      subtitle: 'A professional website for presenting services, value, and customer results.',
      sectionHeading: 'Our Services',
      sectionBody:
        'We help clients solve problems with clear strategy, reliable execution, and modern digital solutions. Use this section to explain services, process, and client value.',
      ctaTitle: 'Start Your Project',
      ctaSubtitle: 'Tell us what you need and we will help you move forward.',
      buttonText: 'Get Started',
    };
  }

  if (
    lowerPrompt.includes('shop') ||
    lowerPrompt.includes('store') ||
    lowerPrompt.includes('product')
  ) {
    return {
      imageUrl: imageLibrary.shop,
      imageCaption: 'A storefront-style image for showcasing products.',
      imageAltText: 'Modern product store display',
      title: 'Discover Products You’ll Love',
      subtitle: 'A simple storefront-style page for showcasing products and guiding customers to buy.',
      sectionHeading: 'Featured Products',
      sectionBody:
        'Highlight your best products, explain their value, and make it easy for visitors to take action. Use this section for product categories, benefits, and offers.',
      ctaTitle: 'Ready to Shop?',
      ctaSubtitle: 'Browse the collection and find what fits your needs.',
      buttonText: 'Shop Now',
    };
  }

  return {
    imageUrl: imageLibrary.default,
    imageCaption: 'A professional visual section generated for this page.',
    imageAltText: 'Professional workspace image',
    title: 'Welcome to Your New Website',
    subtitle: prompt || 'A professional website generated with VibeBuilder.',
    sectionHeading: 'About This Website',
    sectionBody:
      'This page was generated from a prompt. You can edit every section, reorder blocks, add images, and save the final layout to SELISE Data Gateway.',
    ctaTitle: 'Ready to Continue?',
    ctaSubtitle: 'Customize this layout and publish your website with VibeBuilder.',
    buttonText: 'Get Started',
  };
};

export const generateLayoutFromPrompt = (prompt: string): LayoutComponent[] => {
  const theme = getPromptTheme(prompt);

  return [
    {
      id: createId('hero'),
      type: 'hero',
      props: {
        title: theme.title,
        subtitle: theme.subtitle,
        buttonText: theme.buttonText,
      },
    },
    {
      id: createId('image'),
      type: 'image',
      props: {
        imageUrl: theme.imageUrl,
        altText: theme.imageAltText,
        caption: theme.imageCaption,
      },
    },
    {
      id: createId('text'),
      type: 'text',
      props: {
        heading: theme.sectionHeading,
        body: theme.sectionBody,
      },
    },
    {
      id: createId('cta'),
      type: 'cta',
      props: {
        title: theme.ctaTitle,
        subtitle: theme.ctaSubtitle,
        buttonText: theme.buttonText,
      },
    },
  ];
};