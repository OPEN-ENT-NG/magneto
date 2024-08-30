import { emptySplitApi } from "./empltySplitApi.service";
import { Sections } from "~/providers/BoardProvider/types";

export const sectionsApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getSectionsByBoard: builder.query<Sections, string>({
      query: (boardId: string) => {
        return `sections/${boardId}`;
      },
      providesTags: ["Sections"],
    }),
  }),
});

export const { useGetSectionsByBoardQuery } = sectionsApi;
