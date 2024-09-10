import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { emptySplitApi } from "./empltySplitApi.service";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { Cards, ICardsResponse } from "~/models/card.model";
import { Section } from "~/providers/BoardProvider/types";

interface BoardsResponse {
  all: IBoardItemResponse[];
}

interface SectionsResponse {
  all: Section[];
}

export const boardApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getBoardData: builder.query<Board, string>({
      async queryFn(boardId, _queryApi, _extraOptions, fetchWithBQ) {
        const boardResult = (await fetchWithBQ({
          url: "boards",
          method: "POST",
          body: { boardIds: [boardId] },
        })) as { data: BoardsResponse; error?: FetchBaseQueryError };
        if (boardResult.error) return { error: boardResult.error };
        const boardData = boardResult.data.all[0];
        const newBoard = new Board().build(boardData);

        if (boardData.layoutType !== LAYOUT_TYPE.FREE) {
          const sectionsResult = (await fetchWithBQ(`sections/${boardId}`)) as {
            data: SectionsResponse;
            error?: FetchBaseQueryError;
          };
          if (sectionsResult.error) return { error: sectionsResult.error };
          newBoard.sections = sectionsResult.data.all;

          const cardPromises = newBoard.sections.map((section) =>
            fetchWithBQ(`cards/section/${section._id}`),
          );
          const cardsResults = await Promise.all(cardPromises);
          newBoard.sections = newBoard.sections.map((section, index) => ({
            ...section,
            cards: new Cards(cardsResults[index].data as ICardsResponse).all,
          }));
        } else {
          const allCardsResult = await fetchWithBQ(`cards/${boardId}`);
          if (allCardsResult.error) return { error: allCardsResult.error };
          newBoard.cards = new Cards(allCardsResult.data as ICardsResponse).all;
        }
        return { data: newBoard };
      },
      providesTags: ["BoardData"],
    }),
  }),
});

export const { useGetBoardDataQuery } = boardApi;
