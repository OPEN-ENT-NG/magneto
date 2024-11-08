import { emptySplitApi } from "./empltySplitApi.service";
import {
  CommentsResponse,
  GetAllCommentsParams,
  AddCommentParams,
  UpdateCommentParams,
  DeleteCommentResponse,
  DeleteCommentParams,
} from "~/models/comment.types";

export const commentApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllComments: builder.query<CommentsResponse, GetAllCommentsParams>({
      query: ({ cardId, page }) => {
        const queryParams = new URLSearchParams();
        queryParams.append("page", (page ?? 0).toString());

        return {
          url: `/card/${cardId}/comments?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["CardComments"],
    }),

    addComment: builder.mutation<Comment, AddCommentParams>({
      query: ({ cardId, content }) => ({
        url: `/card/${cardId}/comment`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: ["BoardData", "CardComments"],
    }),

    updateComment: builder.mutation<Comment, UpdateCommentParams>({
      query: ({ cardId, commentId, content }) => ({
        url: `/card/${cardId}/comment/${commentId}`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: ["BoardData", "CardComments"],
    }),

    deleteComment: builder.mutation<DeleteCommentResponse, DeleteCommentParams>(
      {
        query: ({ cardId, commentId }) => ({
          url: `/card/${cardId}/comment/${commentId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["BoardData", "CardComments"],
      },
    ),
  }),
});

export const {
  useGetAllCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;
