import { emptySplitApi } from "./emptySplitApi.service";
import {
  ICardPayload,
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
    updateCard: builder.mutation({
      query: (params: CardPayload) => ({
        url: "card",
        method: "PUT",
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
    deleteCards: builder.mutation({
      query: (params: { boardId: string; cardIds: string[] }) => ({
        url: `cards/${params.boardId}`,
        method: "DELETE",
        body: { cardIds: params.cardIds },
      }),
      invalidatesTags: ["BoardData"],
    }),
    moveCard: builder.mutation({
      query: ({ boardId, card }: { boardId: string; card: ICardPayload }) => ({
        url: "card/move",
        method: "POST",
        body: {
          boardId,
          card,
        },
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
  useUpdateCardMutation,
  useDuplicateCardMutation,
  useFavoriteCardMutation,
  useDeleteCardsMutation,
  useMoveCardMutation,
} = cardsApi;
