import { graphqlClient } from '@/lib/graphql-client';
import { GET_WEBSITE_PAGES_QUERY, GET_WEBSITE_PROJECTS_QUERY } from '../graphql/queries';
import {
  DELETE_WEBSITE_PAGE_MUTATION,
  INSERT_WEBSITE_PAGE_MUTATION,
  UPDATE_WEBSITE_PAGE_MUTATION,
} from '../graphql/mutations';
import {
  UpdateWebsitePageResult,
  WebsitePageResult,
  WebsiteProjectResult,
} from '../types/vibebuilder.types';

type CreateWebsitePageInput = {
  projectId: string;
  ownerUserId: string;
  pageName: string;
  pageSlug: string;
  layoutJson: string;
  displayOrder: number;
  isHomePage: boolean;
};

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

export const createWebsitePage = async (input: CreateWebsitePageInput): Promise<void> => {
  await graphqlClient.mutate({
    query: INSERT_WEBSITE_PAGE_MUTATION,
    variables: {
      input,
    },
  });
};

export const updateWebsitePageLayout = async (
  pageId: string,
  layoutJson: string
): Promise<UpdateWebsitePageResult> => {
  return graphqlClient.mutate<UpdateWebsitePageResult>({
    query: UPDATE_WEBSITE_PAGE_MUTATION,
    variables: {
      pageId,
      input: {
        layoutJson,
      },
    },
  });
};

export const deleteWebsitePage = async (pageId: string): Promise<void> => {
  await graphqlClient.mutate({
    query: DELETE_WEBSITE_PAGE_MUTATION,
    variables: {
      pageId,
    },
  });
};