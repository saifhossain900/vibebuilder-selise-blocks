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