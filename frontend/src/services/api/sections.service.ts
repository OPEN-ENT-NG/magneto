import { emptySplitApi } from "./empltySplitApi.service";
import { Sections } from "~/providers/BoardProvider/types";

export const sectionsApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getSectionsByBoard: builder.query<Sections, string>({
      query: (boardId: string) => {
        return `sections/${boardId}`;
      },
      providesTags: (result, error, arg) => [{ type: "Sections", id: arg }],
    }),
  }),
});

export const { useGetSectionsByBoardQuery } = sectionsApi;
