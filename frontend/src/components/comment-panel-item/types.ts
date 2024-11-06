import { Comment } from "~/models/comment.types";

export interface CommentPanelItemProps {
  comment: Comment;
  cardId: string;
  isEditing: boolean;
  onStartEditing: () => void;
  onStopEditing: () => void;
}

export interface CommentInputProps {
  isEditing: boolean;
}
