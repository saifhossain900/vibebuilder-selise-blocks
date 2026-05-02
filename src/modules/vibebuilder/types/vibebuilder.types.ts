export type WebsiteProject = {
  ItemId: string;
  ownerUserId: string;
  siteName: string;
  siteSlug: string;
  description?: string;
  isPublished: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type WebsitePage = {
  ItemId: string;
  projectId: string;
  ownerUserId: string;
  pageName: string;
  pageSlug: string;
  layoutJson: string;
  displayOrder: number;
  isHomePage: boolean;
};

export type LayoutComponentType =
  | 'hero'
  | 'text'
  | 'cta'
  | 'image'
  | 'services'
  | 'testimonials';

export type LayoutComponent = {
  id: string;
  type: LayoutComponentType;
  props: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    heading?: string;
    body?: string;
    imageUrl?: string;
    altText?: string;
    caption?: string;
    serviceOneTitle?: string;
    serviceOneBody?: string;
    serviceTwoTitle?: string;
    serviceTwoBody?: string;
    serviceThreeTitle?: string;
    serviceThreeBody?: string;
    testimonialOneName?: string;
    testimonialOneQuote?: string;
    testimonialTwoName?: string;
    testimonialTwoQuote?: string;
    testimonialThreeName?: string;
    testimonialThreeQuote?: string;
  };
};

export type LayoutData = {
  components: LayoutComponent[];
};

export type WebsiteProjectResult = {
  getWebsiteProjects: {
    items: WebsiteProject[];
    totalCount: number;
  };
};

export type WebsitePageResult = {
  getWebsitePages: {
    items: WebsitePage[];
    totalCount: number;
  };
};

export type UpdateWebsitePageResult = {
  updateWebsitePage: {
    itemId?: string;
    totalImpactedData?: number;
    acknowledged?: boolean;
    __typename?: string;
  };
};