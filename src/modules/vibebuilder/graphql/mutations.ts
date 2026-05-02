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