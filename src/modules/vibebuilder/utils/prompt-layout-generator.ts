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
      servicesTitle: 'Skills & Strengths',
      servicesSubtitle: 'Highlight the main strengths that make this portfolio stand out.',
      serviceOneTitle: 'Frontend Development',
      serviceOneBody: 'Build clean, responsive, and user-friendly interfaces.',
      serviceTwoTitle: 'Problem Solving',
      serviceTwoBody: 'Turn ideas and requirements into practical digital solutions.',
      serviceThreeTitle: 'Project Delivery',
      serviceThreeBody: 'Create organized, reliable, and presentation-ready work.',
      testimonialsTitle: 'Recommendations',
      testimonialsSubtitle: 'Show trust through feedback from people you worked with.',
      testimonialOneName: 'Project Partner',
      testimonialOneQuote:
        'The work was organized, clear, and easy to understand from start to finish.',
      testimonialTwoName: 'Team Member',
      testimonialTwoQuote:
        'A reliable person who can turn ideas into practical project results.',
      testimonialThreeName: 'Client',
      testimonialThreeQuote:
        'The final website feels clean, professional, and ready to present.',
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
      servicesTitle: 'Menu Highlights',
      servicesSubtitle: 'Show visitors the most attractive parts of your restaurant.',
      serviceOneTitle: 'Fresh Ingredients',
      serviceOneBody: 'Prepared with quality ingredients and attention to taste.',
      serviceTwoTitle: 'Signature Dishes',
      serviceTwoBody: 'Feature your most popular meals and customer favorites.',
      serviceThreeTitle: 'Easy Ordering',
      serviceThreeBody: 'Guide customers to reserve, order, or contact quickly.',
      testimonialsTitle: 'Happy Customers',
      testimonialsSubtitle: 'Use customer feedback to build trust and interest.',
      testimonialOneName: 'Regular Guest',
      testimonialOneQuote:
        'The food feels fresh, warm, and full of flavor every time.',
      testimonialTwoName: 'Food Lover',
      testimonialTwoQuote:
        'A welcoming place with great service and a memorable experience.',
      testimonialThreeName: 'Local Customer',
      testimonialThreeQuote:
        'Easy to order, easy to enjoy, and always worth coming back.',
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
      sectionHeading: 'What We Do',
      sectionBody:
        'We help clients solve problems with clear strategy, reliable execution, and modern digital solutions. Use this section to explain services, process, and client value.',
      servicesTitle: 'Our Services',
      servicesSubtitle: 'Show the main services your business provides to clients.',
      serviceOneTitle: 'Strategy',
      serviceOneBody: 'Plan clear goals, direction, and execution steps.',
      serviceTwoTitle: 'Design',
      serviceTwoBody: 'Create modern, clean, and professional digital experiences.',
      serviceThreeTitle: 'Delivery',
      serviceThreeBody: 'Launch reliable solutions that are easy to manage and scale.',
      testimonialsTitle: 'Client Feedback',
      testimonialsSubtitle: 'Build credibility with proof from satisfied clients.',
      testimonialOneName: 'Startup Founder',
      testimonialOneQuote:
        'The team helped us present our business clearly and professionally.',
      testimonialTwoName: 'Business Owner',
      testimonialTwoQuote:
        'The process was simple, organized, and focused on real results.',
      testimonialThreeName: 'Marketing Lead',
      testimonialThreeQuote:
        'The final website made our services easier to understand and trust.',
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
      servicesTitle: 'Why Shop With Us',
      servicesSubtitle: 'Show customers the main reasons to trust and buy from this store.',
      serviceOneTitle: 'Quality Products',
      serviceOneBody: 'Showcase selected products with clear benefits.',
      serviceTwoTitle: 'Simple Shopping',
      serviceTwoBody: 'Make product discovery and purchase decisions easy.',
      serviceThreeTitle: 'Customer Trust',
      serviceThreeBody: 'Build confidence with reliability, support, and clear value.',
      testimonialsTitle: 'Customer Reviews',
      testimonialsSubtitle: 'Use reviews to make new visitors feel confident.',
      testimonialOneName: 'Verified Buyer',
      testimonialOneQuote:
        'The product was exactly what I needed and easy to understand.',
      testimonialTwoName: 'Returning Customer',
      testimonialTwoQuote:
        'A simple shopping experience with clear product information.',
      testimonialThreeName: 'Happy Customer',
      testimonialThreeQuote:
        'The website helped me choose quickly and confidently.',
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
    servicesTitle: 'Key Features',
    servicesSubtitle: 'Highlight the most important parts of this website.',
    serviceOneTitle: 'Clear Structure',
    serviceOneBody: 'Organize the page into useful sections.',
    serviceTwoTitle: 'Editable Blocks',
    serviceTwoBody: 'Change text, images, layout, and content easily.',
    serviceThreeTitle: 'Public Website',
    serviceThreeBody: 'Publish the page and share it through a live URL.',
    testimonialsTitle: 'What People Say',
    testimonialsSubtitle: 'Add feedback to make the page feel more trustworthy.',
    testimonialOneName: 'Visitor One',
    testimonialOneQuote: 'The page is clear, organized, and easy to understand.',
    testimonialTwoName: 'Visitor Two',
    testimonialTwoQuote: 'The sections explain the website purpose very well.',
    testimonialThreeName: 'Visitor Three',
    testimonialThreeQuote: 'A professional layout that is ready to customize.',
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
      id: createId('services'),
      type: 'services',
      props: {
        title: theme.servicesTitle,
        subtitle: theme.servicesSubtitle,
        serviceOneTitle: theme.serviceOneTitle,
        serviceOneBody: theme.serviceOneBody,
        serviceTwoTitle: theme.serviceTwoTitle,
        serviceTwoBody: theme.serviceTwoBody,
        serviceThreeTitle: theme.serviceThreeTitle,
        serviceThreeBody: theme.serviceThreeBody,
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
      id: createId('testimonials'),
      type: 'testimonials',
      props: {
        title: theme.testimonialsTitle,
        subtitle: theme.testimonialsSubtitle,
        testimonialOneName: theme.testimonialOneName,
        testimonialOneQuote: theme.testimonialOneQuote,
        testimonialTwoName: theme.testimonialTwoName,
        testimonialTwoQuote: theme.testimonialTwoQuote,
        testimonialThreeName: theme.testimonialThreeName,
        testimonialThreeQuote: theme.testimonialThreeQuote,
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