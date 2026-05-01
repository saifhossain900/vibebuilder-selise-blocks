export const GET_WEBSITE_PROJECTS_QUERY = `
  query GetWebsiteProjects {
    getWebsiteProjects {
      items {
        ItemId
        ownerUserId
        siteName
        siteSlug
        description
        isPublished
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

export const GET_WEBSITE_PAGES_QUERY = `
  query GetWebsitePages {
    getWebsitePages {
      items {
        ItemId
        projectId
        ownerUserId
        pageName
        pageSlug
        layoutJson
        displayOrder
        isHomePage
      }
      totalCount
    }
  }
`;