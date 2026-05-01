import { graphqlClient } from '@/lib/graphql-client';
import { GET_WEBSITE_PAGES_QUERY, GET_WEBSITE_PROJECTS_QUERY } from '../graphql/queries';
import { WebsitePageResult, WebsiteProjectResult } from '../types/vibebuilder.types';

export const getWebsiteProjects = async (): Promise<WebsiteProjectResult> => {
  return graphqlClient.query<WebsiteProjectResult>({
    query: GET_WEBSITE_PROJECTS_QUERY,
  });
};

export const getWebsitePages = async (): Promise<WebsitePageResult> => {
  return graphqlClient.query<WebsitePageResult>({
    query: GET_WEBSITE_PAGES_QUERY,
  });
};