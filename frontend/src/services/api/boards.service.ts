import { emptySplitApi } from "./empltySplitApi.service";
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
      query: (boardId: String) => ({
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
      query: (boardIds: String[]) => ({
        url: `boards/predelete`,
        method: "PUT",
        body: { boardIds: boardIds },
      }),
      invalidatesTags: ["Boards"],
    }),
    deleteBoards: builder.mutation({
      query: (boardIds: String[]) => ({
        url: `boards`,
        method: "DELETE",
        body: { boardIds: boardIds },
      }),
      invalidatesTags: ["Boards"],
    }),
    restorePreDeleteBoards: builder.mutation({
      query: (boardIds: String[]) => ({
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
  }),
});

export const {
  useGetBoardsQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDuplicateBoardMutation,
  useMoveBoardsMutation,
  usePreDeleteBoardsMutation,
  useDeleteBoardsMutation,
  useRestorePreDeleteBoardsMutation,
  useGetUrlQuery,
} = boardsApi;
