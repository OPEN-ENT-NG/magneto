export interface CommentConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  anchorEl: HTMLElement | null;
}

export interface StyleProps {
  rect: DOMRect;
}
