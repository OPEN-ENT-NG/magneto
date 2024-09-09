import { emptySplitApi } from "./empltySplitApi.service";
import { Card, ICardsParamsRequest } from "../../models/card.model";

export const cardsApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCardsCollection: builder.query({
      query: (params: ICardsParamsRequest) =>
        `cards/collection?boardId=${params.boardId}&searchText=${params.searchText}&sortBy=${params.sortBy}&isPublic=${params.isPublic}&isFavorite=${params.isFavorite}&isShared=${params.isShared}&page=${params.page}`,
    }),
    getAllCardsBySection: builder.query({
      query: (sectionId: string) => `/magneto/cards/section/${sectionId}`,
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.map((card: Card) => ({
                type: "Cards" as const,
                id: card.id,
              })),
            ]
          : [],
    }),
  }),
});

export const { useGetAllCardsCollectionQuery, useGetAllCardsBySectionQuery } =
  cardsApi;
