import {
  Board,
  IBoardsParamsRequest,
} from "~/models/board.model";
import { emptySplitApi } from "./empltySplitApi.service";
import { odeServices } from "edifice-ts-client";


export const boardsApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getBoards: builder.query({
      query: (params: IBoardsParamsRequest) => {
        let urlParams: string =
          `?isPublic=${params.public}&isShared=${params.isShared}` +
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
  }),
});

export const getAllBoards = async (
  params: IBoardsParamsRequest,
): Promise<Board[]> => {
  let urlParams: string =
    `?isPublic=${params.public}&isShared=${params.isShared}` +
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

  const boards = await odeServices.http().get(`/magneto/boards${urlParams}`);
  return boards.all as Board[];
};


export const { useGetBoardsQuery } = boardsApi;
