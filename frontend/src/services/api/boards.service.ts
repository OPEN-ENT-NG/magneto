import { emptySplitApi } from "./emptySplitApi.service";
import {
  IBoardsParamsRequest,
  IBoardPayload,
  Boards,
} from "~/models/board.model";

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

        if (params.allFolders !== null) {
          urlParams += `&allFolders=${params.allFolders}`;
        }

        return `boards${urlParams}`;
      },
      providesTags: ["Boards"],
    }),
    getBoardsByIds: builder.query({
      query: (ids: string[]) => ({
        url: "boards",
        method: "POST",
        body: { boardIds: ids },
      }),
      providesTags: ["Boards"],
    }),
    getBoardsByIdsPublic: builder.query({
      query: (ids: string[]) => ({
        url: "boards/public",
        method: "POST",
        body: { boardIds: ids },
      }),
      providesTags: ["Boards"],
    }),
    notifyBoardUsers: builder.mutation({
      query: (idBoard: string) => ({
        url: `board/${idBoard}/notify`,
        method: "POST",
      }),
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

        if (
          params.searchText !== undefined &&
          params.searchText !== null &&
          params.searchText !== ""
        ) {
          urlParams += `&searchText=${params.searchText}`;
        }

        if (params.isExclusivelyShared != null)
          urlParams += `&isExclusivelyShared=${params.isExclusivelyShared}`;

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
      invalidatesTags: ["Boards", "BoardData"],
    }),
    updateBoardCards: builder.mutation({
      query: (params: IBoardPayload) => ({
        url: `board/${params.id}/cards`,
        method: "PUT",
        body: params,
      }),
      invalidatesTags: ["Boards", "BoardData"],
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
    getAllBoardsEditable: builder.query<Boards, void>({
      query: () => `boards/editable`,
    }),
    getAllBoardImages: builder.query({
      query: (boardIds: string[]) => ({
        url: "boards/imageUrl",
        method: "POST",
        body: { boardIds: boardIds },
      }),
      providesTags: ["Boards"],
    }),
    updatePublicBoard: builder.mutation({
      query: (boardId: string) => ({
        url: `pub/${boardId}`,
        method: "PUT",
      }),
    }),
    getIsExternal: builder.query({
      query: (boardId: string) => ({
        url: `board/${boardId}/external`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetBoardsQuery,
  useGetAllBoardsQuery,
  useGetBoardsByIdsQuery,
  useGetBoardsByIdsPublicQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDuplicateBoardMutation,
  useMoveBoardsMutation,
  usePreDeleteBoardsMutation,
  useDeleteBoardsMutation,
  useRestorePreDeleteBoardsMutation,
  useGetUrlQuery,
  useGetAllBoardsEditableQuery,
  useGetAllBoardImagesQuery,
  useNotifyBoardUsersMutation,
  useUpdateBoardCardsMutation,
  useUpdatePublicBoardMutation,
  useGetIsExternalQuery,
} = boardsApi;
