import { emptySplitApi } from "./empltySplitApi.service";
import {
  IBoardsParamsRequest,
  IBoardPayload,
  Board,
} from "~/models/board.model";
import { Section } from "~/providers/BoardProvider/types";
import { Card } from "~/models/card.model";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

// 1. Redéfinition de fetchWithBQ avec des types en paramètre
async function fetchWithBQ<T>(options: {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
}): Promise<{ data?: T; error?: FetchBaseQueryError | { message: string } }> {
  try {
    // Exécution de la requête HTTP
    console.log(options.body);
    const response = await fetch(options.url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // Vérifiez si la réponse est en erreur
    if (!response.ok) {
      // Tentez de lire l'erreur (si elle est en JSON), sinon retournez une chaîne de caractère
      const errorText = await response.text(); // Utilisez text() pour éviter des erreurs de JSON vide
      let errorData;
      try {
        errorData = JSON.parse(errorText); // Si le texte est JSON valide
      } catch {
        errorData = errorText; // Sinon, c'est juste du texte ou vide
      }
      return { error: { status: response.status, data: errorData } };
    }

    // Vérifiez si le corps de la réponse est vide (pour éviter l'erreur JSON)
    const contentLength = response.headers.get("Content-Length");
    if (!contentLength || contentLength === "0") {
      return { data: undefined as unknown as T }; // Pas de contenu, on retourne undefined
    }

    // Sinon, parsez les données comme JSON
    const data = (await response.json()) as T;
    return { data }; // Type "data" est maintenant bien défini comme T
  } catch (error) {
    // Gestion des erreurs réseau ou inattendues
    return {
      error: {
        message: `Network error: ${String(error)}`,
      },
    };
  }
}

export const boardsApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getBoards: builder.query({
      query: (params: IBoardsParamsRequest) => {
        let urlParams: string =
          `?isPublic=${params.isPublic}&isShared=${params.isShared}` +
          `&isDeleted=${params.isDeleted}&sortBy=${params.sortBy}`;

        if (params.folderId) {
          urlParams += `&folderId=${params.folderId}`;
        }

        if (params.page != null) {
          urlParams += `&page=${params.page}`;
        }

        if (
          params.searchText !== undefined &&
          params.searchText !== null &&
          params.searchText !== ""
        ) {
          urlParams += `&searchText=${params.searchText}`;
        }

        return `boards${urlParams}`;
      },
      providesTags: ["Boards"],
    }),
    getBoardsByIds: builder.query<
      { board: Board; sections: Section[] },
      string
    >({
      async queryFn(boardId, _queryApi, _extraOptions) {
        try {
          // 1. Définir le type pour la réponse du board
          interface BoardResponse {
            all: Board[];
          }

          // 2. Utiliser fetchWithBQ en passant un type générique
          const boardResponse = await fetchWithBQ<BoardResponse>({
            url: `magneto/boards`,
            method: "POST",
            body: { boardIds: [boardId] },
          });

          console.log(boardResponse);

          if (boardResponse.error) throw boardResponse.error;
          const board = boardResponse.data?.all[0]; // Typé correctement

          if (!board) throw new Error("Board not found");

          // 3. Récupérer les sections associées au board
          const sectionsResponse = await fetchWithBQ<{ data: Section[] }>({
            url: `/boards/${boardId}/sections`,
            method: "GET",
          });
          if (sectionsResponse.error) throw sectionsResponse.error;
          const sections = sectionsResponse.data?.data || [];

          // 4. Pour chaque section, récupérer les cartes
          const cardsPromises = sections.map(async (section) => {
            const cardsResponse = await fetchWithBQ<{ data: Card[] }>({
              url: `/sections/${section.id}/cards`,
              method: "GET",
            });
            if (cardsResponse.error) throw cardsResponse.error;
            return {
              sectionId: section.id,
              cards: cardsResponse.data?.data || [],
            };
          });

          const cardsResults = await Promise.all(cardsPromises);

          // Associer les cartes aux sections
          const updatedSections = sections.map((section) => {
            const cardsForSection =
              cardsResults.find((c) => c.sectionId === section.id)?.cards || [];
            return { ...section, cards: cardsForSection };
          });

          return { data: { board, sections: updatedSections } };
        } catch (error) {
          return { error: error as FetchBaseQueryError };
        }
      },
    }),

    getAllBoards: builder.query({
      query: (params: IBoardsParamsRequest) => {
        let urlParams: string =
          `?isPublic=${params.isPublic}&isShared=${params.isShared}` +
          `&isDeleted=${params.isDeleted}&sortBy=${params.sortBy}` +
          `&allFolders=true`;

        if (params.page != null) {
          urlParams += `&page=${params.page}`;
        }

        return `boards${urlParams}`;
      },
      providesTags: ["Boards"],
    }),
    createBoard: builder.mutation({
      query: (params: IBoardPayload) => ({
        url: "board",
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["Boards"],
    }),
    updateBoard: builder.mutation({
      query: (params: IBoardPayload) => ({
        url: `board/${params.id}`,
        method: "PUT",
        body: params,
      }),
      invalidatesTags: ["Boards"],
    }),
    duplicateBoard: builder.mutation({
      query: (boardId: string) => ({
        url: `board/duplicate/${boardId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Boards"],
    }),
    moveBoards: builder.mutation({
      query: (params) => ({
        url: `boards/folder/${params.folderId}`,
        method: "PUT",
        body: { boardIds: params.boardIds },
      }),
      invalidatesTags: ["Boards"],
    }),
    preDeleteBoards: builder.mutation({
      query: (boardIds: string[]) => ({
        url: `boards/predelete`,
        method: "PUT",
        body: { boardIds: boardIds },
      }),
      invalidatesTags: ["Boards"],
    }),
    deleteBoards: builder.mutation({
      query: (boardIds: string[]) => ({
        url: `boards`,
        method: "DELETE",
        body: { boardIds: boardIds },
      }),
      invalidatesTags: ["Boards"],
    }),
    restorePreDeleteBoards: builder.mutation({
      query: (boardIds: string[]) => ({
        url: `boards/restore`,
        method: "put",
        body: { boardIds: boardIds },
      }),
      invalidatesTags: ["Boards"],
    }),
    getUrl: builder.query({
      query: (cover: File) => {
        return URL.createObjectURL(cover);
      },
    }),
    moveBoardsToFolder: builder.mutation({
      query: (params: { boardIds: string[]; folderId: string }) => ({
        url: `boards/folder/${params.folderId}`,
        method: "PUT",
        body: { boardIds: params.boardIds },
      }),
    }),
  }),
});

export const {
  useGetBoardsQuery,
  useGetAllBoardsQuery,
  useGetBoardsByIdsQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDuplicateBoardMutation,
  useMoveBoardsMutation,
  usePreDeleteBoardsMutation,
  useDeleteBoardsMutation,
  useRestorePreDeleteBoardsMutation,
  useGetUrlQuery,
} = boardsApi;
