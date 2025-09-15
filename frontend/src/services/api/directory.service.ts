import {} from "~/models/comment.types";

import { emptySplitDirectory } from "./emptySplitDirectory";

export const directoryApi = emptySplitDirectory.injectEndpoints({
  endpoints: (builder) => ({
    getUserbookInfos: builder.query<any, { id: string }>({
      query: ({ id }) => ({
        url: `userbook/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetUserbookInfosQuery } = directoryApi;
