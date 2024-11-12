import { emptySplitApi } from "./empltySplitApi.service";
import {
  ICardsBoardParamsRequest,
  ICardsParamsRequest,
  ICardsResponse,
} from "../../models/card.model";
import { CardPayload } from "~/components/create-magnet/types";

export const cardsApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCardsCollection: builder.query({
      query: (params: ICardsParamsRequest) =>
        `cards/collection?boardId=${params.boardId}&searchText=${params.searchText}&sortBy=${params.sortBy}&isPublic=${params.isPublic}&isFavorite=${params.isFavorite}&isShared=${params.isShared}&page=${params.page}`,
      providesTags: ["AllCards"],
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
    duplicateCard: builder.mutation({
      query: (params: ICardsBoardParamsRequest) => ({
        url: "card/duplicate",
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["BoardData"],
    }),
    favoriteCard: builder.mutation({
      query: (params: { cardId: string; isFavorite: boolean }) => ({
        url: `card/${params.cardId}/favorite`,
        method: "PUT",
        body: { isFavorite: params.isFavorite },
      }),
      invalidatesTags: ["BoardData", "AllCards"],
    }),
  }),
});

export const {
  useGetAllCardsCollectionQuery,
  useLazyGetCardsBySectionQuery,
  useLazyGetAllCardsByBoardIdQuery,
  useCreateCardMutation,
  useDuplicateCardMutation,
  useFavoriteCardMutation,
} = cardsApi;
