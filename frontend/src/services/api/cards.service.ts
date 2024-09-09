import { emptySplitApi } from "./empltySplitApi.service";
import { ICardsParamsRequest } from "../../models/card.model";

export const cardsApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCardsCollection: builder.query({
      query: (params: ICardsParamsRequest) =>
        `cards/collection?boardId=${params.boardId}&searchText=${params.searchText}&sortBy=${params.sortBy}&isPublic=${params.isPublic}&isFavorite=${params.isFavorite}&isShared=${params.isShared}&page=${params.page}`,
    }),
    getAllCardsByBoard: builder.query({
      query: (params: ICardsParamsRequest) => {
        let pageParams: string = params.page !== null && params.page !== undefined ? `?page=${params.page}` : '';
        let fromStartPage: string = params.fromStartPage !== null && params.fromStartPage !== undefined ? `&fromStartPage=${params.fromStartPage}` : '';
        return `cards/${params.boardId}${pageParams}${fromStartPage}`
      }
    }),
  }),
});

export const { useGetAllCardsCollectionQuery, useGetAllCardsByBoardQuery } = cardsApi;
