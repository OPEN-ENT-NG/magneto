import { emptySplitApi } from "./empltySplitApi.service";
import { ICardsParamsRequest, ICardsResponse } from "../../models/card.model";
import { CardPayload } from "~/components/create-magnet/types";

export const cardsApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCardsCollection: builder.query({
      query: (params: ICardsParamsRequest) =>
        `cards/collection?boardId=${params.boardId}&searchText=${params.searchText}&sortBy=${params.sortBy}&isPublic=${params.isPublic}&isFavorite=${params.isFavorite}&isShared=${params.isShared}&page=${params.page}`,
    }),
    getCardsBySection: builder.query<ICardsResponse, string>({
      query: (sectionId: string) => {
        return `cards/section/${sectionId}`;
      },
    }),
    getAllCardsByBoardId: builder.query<ICardsResponse, string>({
      query: (boardId: string) => {
        return `cards/${boardId}`;
      },
    }),
    createCard: builder.mutation({
      query: (params: CardPayload) => ({
        url: "card",
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["BoardData"],
    }),
  }),
});

export const {
  useGetAllCardsCollectionQuery,
  useLazyGetCardsBySectionQuery,
  useLazyGetAllCardsByBoardIdQuery,
  useCreateCardMutation,
} = cardsApi;
