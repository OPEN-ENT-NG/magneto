import { emptySplitApi } from "./empltySplitApi.service";
import { SectionPayload } from "~/models/board.model";
import { Sections } from "~/providers/BoardProvider/types";

export const sectionsApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getSectionsByBoard: builder.query<Sections, string>({
      query: (boardId: string) => {
        return `sections/${boardId}`;
      },
      providesTags: ["Sections"],
    }),
    createSection: builder.mutation<SectionPayload, Partial<SectionPayload>>({
      query: (sectionData) => ({
        url: "section",
        method: "POST",
        body: sectionData,
      }),
      invalidatesTags: ["Sections", "BoardData"],
    }),
    updateSection: builder.mutation<SectionPayload, Partial<SectionPayload>>({
      query: (sectionData) => ({
        url: "section",
        method: "PUT",
        body: sectionData,
      }),
      invalidatesTags: ["Sections", "BoardData"],
    }),
    duplicateSection: builder.mutation<SectionPayload, Partial<SectionPayload>>(
      {
        query: (sectionData) => ({
          url: "section/duplicate",
          method: "POST",
          body: sectionData,
        }),
        invalidatesTags: ["Sections", "BoardData"],
      },
    ),
    deleteSection: builder.mutation<SectionPayload, Partial<SectionPayload>>({
      query: (sectionData) => ({
        url: "sections",
        method: "DELETE",
        body: sectionData,
      }),
      invalidatesTags: ["Sections", "BoardData"],
    }),
  }),
});

export const {
  useGetSectionsByBoardQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDuplicateSectionMutation,
  useDeleteSectionMutation,
} = sectionsApi;
