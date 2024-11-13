import {
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";

import { emptySplitApi } from "./emptySplitApi.service";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { IBoardItemResponse } from "~/models/board.model";
import { ICardsResponse } from "~/models/card.model";
import { Section } from "~/providers/BoardProvider/types";

interface BoardsResponse {
  all: IBoardItemResponse[];
}

interface SectionsResponse {
  all: Section[];
}

export const boardDataApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getBoardData: builder.query<unknown, string>({
      async queryFn(boardId, _queryApi, _extraOptions, fetchWithBQ) {
        const boardResult = (await fetchWithBQ({
          url: "boards",
          method: "POST",
          body: { boardIds: [boardId] },
        })) as {
          error?: undefined;
          data: BoardsResponse;
          meta?: FetchBaseQueryMeta | undefined;
        };
        if (boardResult.error) return { error: boardResult.error };
        const boardData = boardResult.data.all[0];

        if (boardData.layoutType !== LAYOUT_TYPE.FREE) {
          const sectionsResult = (await fetchWithBQ(`sections/${boardId}`)) as {
            data: SectionsResponse;
            error?: FetchBaseQueryError;
          };
          if (sectionsResult.error) return { error: sectionsResult.error };

          const cardPromises = sectionsResult.data.all.map((section) =>
            fetchWithBQ(`cards/section/${section._id}?page=0`),
          );
          const cardsResults = await Promise.all(cardPromises);

          const sectionsWithCards = sectionsResult.data.all.map(
            (section, index) => ({
              ...section,
              cards: (cardsResults[index].data as ICardsResponse).all,
            }),
          );

          return {
            data: {
              ...boardData,
              sections: sectionsWithCards,
            },
          };
        } else {
          const allCardsResult = await fetchWithBQ(`cards/${boardId}`);
          if (allCardsResult.error) return { error: allCardsResult.error };
          const cardMap = new Map(
            (allCardsResult.data as ICardsResponse).all.map((card) => [
              card.id,
              card,
            ]),
          );
          const sortedCards = boardData.cardIds
            .map((id) => cardMap.get(id))
            .filter((card) => card !== undefined);
          return {
            data: {
              ...boardData,
              cards: sortedCards,
            },
          };
        }
      },
      providesTags: ["BoardData"],
    }),
  }),
});

export const { useGetBoardDataQuery } = boardDataApi;
