import { emptySplitApi } from "./emptySplitApi.service";

export const magnetoWorkspaceApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    canEditDocument: builder.query<boolean, string>({
      query: (documentId: string) => `workspace/${documentId}/canedit`,
    }),
  }),
});

export const { useCanEditDocumentQuery } = magnetoWorkspaceApi;
