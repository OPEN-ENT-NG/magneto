import {} from "~/models/comment.types";
import { WorkspaceElement } from "edifice-ts-client";

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
      transformResponse: (response: any) => {
        // Assurez-vous de parser le JSON si nécessaire
        const parsedResponse =
          typeof response === "string" ? JSON.parse(response) : response;

        // Vérifiez et convertissez les données en tableau de WorkspaceElement
        return Array.isArray(parsedResponse) ? parsedResponse : [];
      },
    }),
  }),
});

export const { useGetRessourceQuery, useGetDocumentsQuery } = workspaceApi;
