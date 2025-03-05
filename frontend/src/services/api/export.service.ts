import { emptySplitApi } from "./emptySplitApi.service";

export const exportApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    exportBoard: builder.query<Blob, string>({
      query: (boardId: string) => ({
        url: `/export/slide/${boardId}`,
        method: "GET",
        responseHandler: async (response) => {
          // Si la réponse n'est pas ok, lever une erreur
          if (!response.ok) {
            throw new Error("Erreur lors du téléchargement");
          }
          // Retourner directement le blob
          return response.blob();
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
