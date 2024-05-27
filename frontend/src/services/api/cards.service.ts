import { emptySplitApi } from "./empltySplitApi.service";
import { ICardsParamsRequest } from "../../models/card.model";

export const cardsApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCardsCollection: builder.query({
      query: (params: ICardsParamsRequest) =>
        `cards/collection?boardId=${params.boardId}&searchText=${params.searchText}&sortBy=${params.sortBy}&isPublic=${params.isPublic}&isFavorite=${params.isFavorite}&isShared=${params.isShared}&page=${params.page}`,
    }),
  }),
});

export const { useGetAllCardsCollectionQuery } = cardsApi;
