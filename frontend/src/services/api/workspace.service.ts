import { workspaceSplitApi } from "./empltySplitApi.service";

export const workspaceApi = workspaceSplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getPDFFile: builder.query({
      query: (idDocument: string) => ({
        url: `document/preview/${idDocument}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Documents", id }],
    }),
  }),
  overrideExisting: false,
});

export const { useLazyGetPDFFileQuery } = workspaceApi;
