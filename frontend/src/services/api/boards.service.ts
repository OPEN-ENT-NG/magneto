import { odeServices } from "edifice-ts-client";

import {
  Boards,
  IBoardPayload,
  IBoardsParamsRequest,
} from "~/models/board.model";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const boardsApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "/magneto/" }),
  tagTypes: [],
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
  }),
});

export const { useGetBoardsQuery } = boardsApi;


// export const getBoards = async (
//   params: IBoardsParamsRequest,
// ): Promise<Boards> => {
//   let urlParams: string =
//     `?isPublic=${params.isPublic}&isShared=${params.isShared}` +
//     `&isDeleted=${params.isDeleted}&sortBy=${params.sortBy}`;

//   if (params.folderId) {
//     urlParams += `&folderId=${params.folderId}`;
//   }

//   if (params.page != null) {
//     urlParams += `&page=${params.page}`;
//   }

//   if (
//     params.searchText !== undefined &&
//     params.searchText !== null &&
//     params.searchText !== ""
//   ) {
//     urlParams += `&searchText=${params.searchText}`;
//   }

//   return await odeServices.http().get(`/magneto/folders${urlParams}`);
// };

// export const createBoard = async (params: IBoardPayload): Promise<Boards> => {
//   return await odeServices.http().post(`/magneto/board`, params);
// };

// export const getUrl = async (cover: File): Promise<string> => {
//   return await odeServices.http().get(URL.createObjectURL(cover));
// };
