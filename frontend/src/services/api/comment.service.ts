import { emptySplitApi } from "./empltySplitApi.service";

export const commentApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    addComment: builder.mutation<Comment, { cardId: string; content: string }>({
      query: ({ cardId, content }) => ({
        url: `/card/${cardId}/comment`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: ["BoardData"],
    }),
  }),
});

export const {useAddCommentMutation} = commentApi;
