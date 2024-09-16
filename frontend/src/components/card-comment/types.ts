import { CardComment } from "~/models/card-comment.model";

export interface CardCommentProps {
  commentData: {
    cardComment: CardComment;
    nbOfComment: number;
    cardId: string;
  };
}
