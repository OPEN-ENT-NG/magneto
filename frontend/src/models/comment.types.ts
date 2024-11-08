export interface Comment {
  _id: string;
  content: string;
  ownerId: string;
  ownerName: string;
  creationDate: string;
  modificationDate: string;
}

export interface CommentsResponse {
  all: Comment[];
  count: number;
}

export interface GetAllCommentsParams {
  cardId: string;
  page?: number;
}

export interface AddCommentParams {
  cardId: string;
  content: string;
}

export interface UpdateCommentParams {
  cardId: string;
  commentId: string;
  content: string;
}

export interface DeleteCommentParams {
  cardId: string;
  commentId: string;
}

export interface DeleteCommentResponse {
  _id: string;
}
