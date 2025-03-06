import { emptySplitApi } from "./emptySplitApi.service";

export interface ExportResponse {
  data: Blob;
  headers: Record<string, string>;
}

export const exportApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    exportBoard: builder.query<ExportResponse, string>({
      query: (boardId: string) => ({
        url: `/export/slide/${boardId}`,
        method: "GET",
        responseHandler: async (response) => {
          // Si la réponse n'est pas ok, lever une erreur
          if (!response.ok) {
            throw new Error("Erreur lors du téléchargement");
          }

          // Extraire les en-têtes
          const headers: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            headers[key.toLowerCase()] = value;
          });

          // Retourner un objet contenant le blob et les en-têtes
          const blob = await response.blob();
          return {
            data: blob,
            headers: headers,
          };
        },
        // Désactiver le parsing par défaut
        cache: "no-cache",
        headers: {
          Accept: "application/zip",
        },
      }),
      // Supprimer toute transformation de réponse
      transformResponse: (response) => response,
    }),
  }),
});

export const { useExportBoardQuery } = exportApi;
