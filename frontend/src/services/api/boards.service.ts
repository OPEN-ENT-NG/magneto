import { emptySplitApi } from "./empltySplitApi.service";
import { IBoardPayload, IBoardsParamsRequest } from "~/models/board.model";

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
    }),
    createBoard: builder.mutation({
      query: (params: IBoardPayload) => ({
        url: "board",
        method: "POST",
        body: params,
      }),
    }),
    getUrl: builder.query({
      query: (cover: File) => {
        return URL.createObjectURL(cover);
      },
    }),
  }),
});

export const { useGetBoardsQuery, useCreateBoardMutation, useGetUrlQuery } =
  boardsApi;
