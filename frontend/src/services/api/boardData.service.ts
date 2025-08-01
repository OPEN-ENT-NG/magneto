import {
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";

import { emptySplitApi } from "./emptySplitApi.service";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import {
  applyBoardUpdate,
  registerCacheUpdateCallback,
} from "~/hooks/useApplyBoardUpdate";
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
    getBoardData: builder.query<
      unknown,
      { boardId: string; isExternal?: boolean }
    >({
      async queryFn(
        { boardId, isExternal = false },
        _queryApi,
        _extraOptions,
        fetchWithBQ,
      ) {
        // Helper function to get the proper URL prefix
        const getUrl = (path: string) => {
          return isExternal ? `${path}/public` : path;
        };

        const boardResult = (await fetchWithBQ({
          url: getUrl("boards"),
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
          const sectionsResult = (await fetchWithBQ(
            getUrl(`sections/${boardId}`),
          )) as {
            data: SectionsResponse;
            error?: FetchBaseQueryError;
          };
          if (sectionsResult.error) return { error: sectionsResult.error };

          const cardPromises = sectionsResult.data.all.map((section) =>
            fetchWithBQ(`${getUrl(`cards/section/${section._id}`)}?page=0`),
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
          const allCardsResult = await fetchWithBQ(getUrl(`cards/${boardId}`));
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
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        let unsubscribe: (() => void) | null = null;

        try {
          // Attendre que les données soient chargées avec un timeout
          await Promise.race([
            cacheDataLoaded,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Cache load timeout")), 10000),
            ),
          ]);

          // S'enregistrer pour recevoir les mises à jour WebSocket
          unsubscribe = registerCacheUpdateCallback((update: any) => {
            updateCachedData((draft) => {
              applyBoardUpdate(draft, update);
            });
          });
        } catch (error) {
          console.error("Error loading cache data:", error);
        }

        try {
          await cacheEntryRemoved;
        } finally {
          // S'assurer que unsubscribe est appelé même si cacheDataLoaded a échoué
          if (unsubscribe) {
            unsubscribe();
          }
        }
      },
      providesTags: ["BoardData"],
    }),
  }),
});

export const { useGetBoardDataQuery } = boardDataApi;
