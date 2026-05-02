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

export const GET_WEBSITE_PAGES_BY_PROJECT_QUERY = `
  query GetWebsitePagesByProject($projectId: String!, $ownerUserId: String!) {
    getWebsitePages(
      where: {
        projectId: {
          eq: $projectId
        }
        ownerUserId: {
          eq: $ownerUserId
        }
      }
    ) {
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