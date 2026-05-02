export const INSERT_WEBSITE_PAGE_MUTATION = `
  mutation InsertWebsitePage($input: WebsitePageInsertInput!) {
    insertWebsitePage(input: $input) {
      __typename
    }
  }
`;

export const UPDATE_WEBSITE_PAGE_MUTATION = `
  mutation UpdateWebsitePage($pageId: String!, $input: WebsitePageUpdateInput!) {
    updateWebsitePage(
      where: {
        ItemId: {
          eq: $pageId
        }
      }
      input: $input
    ) {
      itemId
      totalImpactedData
      acknowledged
    }
  }
`;

export const DELETE_WEBSITE_PAGE_MUTATION = `
  mutation DeleteWebsitePage($pageId: String!) {
    deleteWebsitePage(
      where: {
        ItemId: {
          eq: $pageId
        }
      }
    ) {
      __typename
    }
  }
`;