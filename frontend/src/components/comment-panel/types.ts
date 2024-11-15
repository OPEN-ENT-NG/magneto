import { Comment } from "~/models/comment.types";

export interface CommentPanelProps {
  cardId: string;
  isInCardPreview?: boolean;
  anchorEl: HTMLElement | null;
  anchorOrigin?: {
    vertical: "top" | "center" | "bottom";
    horizontal: "left" | "center" | "right";
  };
  transformOrigin?: {
    vertical: "top" | "center" | "bottom";
    horizontal: "left" | "center" | "right";
  };
}

export interface CommentPanelWrapperProps {
  isInCardPreview: boolean;
}

export type CommentOrDivider = Comment | string;
