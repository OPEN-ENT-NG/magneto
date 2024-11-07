import { Comment } from "~/models/comment.types";

export interface CommentPanelProps {
  cardId: string;
}
export type CommentOrDivider = Comment | string;
