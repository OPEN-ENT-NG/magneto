import {} from "~/models/comment.types";
import { emptySplitWorkspace } from "./emptySplitWorkspace";

export const workspaceApi = emptySplitWorkspace.injectEndpoints({
  endpoints: (builder) => ({
    getRessource: builder.query<any, { visibility: boolean; id: string }>({
      query: ({ visibility, id }) => ({
        url: `${visibility ? "pub/" : ""}document/${id}`,
        method: "GET",
        responseHandler: (response) => response.text(),
      }),
    }),
  }),
});

export const { useGetRessourceQuery } = workspaceApi;
