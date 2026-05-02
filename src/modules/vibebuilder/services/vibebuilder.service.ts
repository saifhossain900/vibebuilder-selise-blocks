import { graphqlClient } from '@/lib/graphql-client';
import {
  GET_WEBSITE_PAGES_BY_PROJECT_QUERY,
  GET_WEBSITE_PAGES_QUERY,
  GET_WEBSITE_PROJECTS_QUERY,
} from '../graphql/queries';
import {
  DELETE_WEBSITE_PAGE_MUTATION,
  INSERT_WEBSITE_PAGE_MUTATION,
  INSERT_WEBSITE_PROJECT_MUTATION,
  UPDATE_WEBSITE_PAGE_MUTATION,
  UPDATE_WEBSITE_PROJECT_MUTATION,
} from '../graphql/mutations';
import {
  UpdateWebsitePageResult,
  WebsitePageResult,
  WebsiteProjectResult,
} from '../types/vibebuilder.types';

type CreateWebsiteProjectInput = {
  ownerUserId: string;
  siteName: string;
  siteSlug: string;
  description: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type UpdateWebsiteProjectInput = {
  siteName?: string;
  siteSlug?: string;
  description?: string;
  isPublished?: boolean;
  updatedAt?: string;
};

type CreateWebsitePageInput = {
  projectId: string;
  ownerUserId: string;
  pageName: string;
  pageSlug: string;
  layoutJson: string;
  displayOrder: number;
  isHomePage: boolean;
};

type UpdateWebsitePageInput = {
  pageName?: string;
  pageSlug?: string;
  layoutJson?: string;
  displayOrder?: number;
  isHomePage?: boolean;
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

export const getWebsitePagesByProject = async (
  projectId: string,
  ownerUserId: string
): Promise<WebsitePageResult> => {
  return graphqlClient.query<WebsitePageResult>({
    query: GET_WEBSITE_PAGES_BY_PROJECT_QUERY,
    variables: {
      projectId,
      ownerUserId,
    },
  });
};

export const createWebsiteProject = async (input: CreateWebsiteProjectInput): Promise<void> => {
  await graphqlClient.mutate({
    query: INSERT_WEBSITE_PROJECT_MUTATION,
    variables: {
      input,
    },
  });
};

export const updateWebsiteProject = async (
  projectId: string,
  input: UpdateWebsiteProjectInput
): Promise<void> => {
  await graphqlClient.mutate({
    query: UPDATE_WEBSITE_PROJECT_MUTATION,
    variables: {
      projectId,
      input,
    },
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

export const updateWebsitePage = async (
  pageId: string,
  input: UpdateWebsitePageInput
): Promise<UpdateWebsitePageResult> => {
  return graphqlClient.mutate<UpdateWebsitePageResult>({
    query: UPDATE_WEBSITE_PAGE_MUTATION,
    variables: {
      pageId,
      input,
    },
  });
};

export const updateWebsitePageLayout = async (
  pageId: string,
  layoutJson: string
): Promise<UpdateWebsitePageResult> => {
  return updateWebsitePage(pageId, {
    layoutJson,
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