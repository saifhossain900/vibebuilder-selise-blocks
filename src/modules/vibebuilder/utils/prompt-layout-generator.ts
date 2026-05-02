import { LayoutComponent } from '../types/vibebuilder.types';

const createId = (prefix: string) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const getPromptTheme = (prompt: string) => {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('personal')) {
    return {
      title: 'Creative Portfolio',
      subtitle: 'A clean personal website to showcase work, skills, and contact information.',
      sectionHeading: 'About Me',
      sectionBody:
        'I am building a professional online presence with a strong introduction, clear services, and an easy way to connect.',
      ctaTitle: 'Let’s Work Together',
      ctaSubtitle: 'Reach out to discuss projects, collaborations, or opportunities.',
      buttonText: 'Contact Me',
    };
  }

  if (lowerPrompt.includes('restaurant') || lowerPrompt.includes('food') || lowerPrompt.includes('cafe')) {
    return {
      title: 'Fresh Taste, Great Experience',
      subtitle: 'A modern food website designed to highlight menu items, atmosphere, and customer trust.',
      sectionHeading: 'Our Story',
      sectionBody:
        'We focus on quality, flavor, and a welcoming experience for every customer who visits us.',
      ctaTitle: 'Reserve or Order Today',
      ctaSubtitle: 'Make your next meal simple, fresh, and memorable.',
      buttonText: 'Order Now',
    };
  }

  if (lowerPrompt.includes('agency') || lowerPrompt.includes('business') || lowerPrompt.includes('startup')) {
    return {
      title: 'Grow Your Business with Confidence',
      subtitle: 'A professional website for presenting services, value, and customer results.',
      sectionHeading: 'What We Do',
      sectionBody:
        'We help clients solve problems with clear strategy, reliable delivery, and modern digital solutions.',
      ctaTitle: 'Start Your Project',
      ctaSubtitle: 'Tell us what you need and we will help you move forward.',
      buttonText: 'Get Started',
    };
  }

  if (lowerPrompt.includes('shop') || lowerPrompt.includes('store') || lowerPrompt.includes('product')) {
    return {
      title: 'Discover Products You’ll Love',
      subtitle: 'A simple storefront-style page for showcasing products and guiding customers to buy.',
      sectionHeading: 'Featured Products',
      sectionBody:
        'Highlight your best products, explain their value, and make it easy for visitors to take action.',
      ctaTitle: 'Ready to Shop?',
      ctaSubtitle: 'Browse the collection and find what fits your needs.',
      buttonText: 'Shop Now',
    };
  }

  return {
    title: 'Welcome to Your New Website',
    subtitle: prompt || 'A professional website generated with VibeBuilder.',
    sectionHeading: 'About This Website',
    sectionBody:
      'This page was generated from a prompt. You can edit every section, reorder blocks, and save the final layout to SELISE Data Gateway.',
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