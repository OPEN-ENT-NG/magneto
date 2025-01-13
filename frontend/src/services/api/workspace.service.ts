import {} from "~/models/comment.types";
import { WorkspaceElement } from "@edifice.io/client";

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
    getDocuments: builder.query<WorkspaceElement[], string>({
      query: () => ({
        url: `documents?filter=all&hierarchical=true`,
        method: "GET",
      }),
      providesTags: ["Documents"],
      transformResponse: (response: any) => {
        const parsedResponse =
          typeof response === "string" ? JSON.parse(response) : response;

        return Array.isArray(parsedResponse) ? parsedResponse : [];
      },
    }),
  }),
});

export const { useGetRessourceQuery, useGetDocumentsQuery } = workspaceApi;
