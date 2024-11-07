import { Comment } from "~/models/comment.types";

export interface CommentPanelItemProps {
  isLast?: boolean;
  comment: Comment;
  cardId: string;
  isEditing: boolean;
  isDeleting: boolean;
  onStartEditing: () => void;
  onStartDeleting: () => void;
  onStopEditing: () => void;
}

export interface CommentInputProps {
  isEditing: boolean;
}

export interface IsLastProps {
  isLast: boolean;
}
