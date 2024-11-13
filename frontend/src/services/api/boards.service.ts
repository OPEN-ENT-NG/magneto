import { emptySplitApi } from "./emptySplitApi.service";
import { IBoardsParamsRequest, IBoardPayload } from "~/models/board.model";

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
    getBoardsByIds: builder.query({
      query: (ids: string[]) => ({
        url: "boards",
        method: "POST",
        body: { boardIds: ids },
      }),
      providesTags: ["Boards"],
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
