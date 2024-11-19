import { ReactNode } from "react";

export interface StyledButtonProps {
  isFilled: boolean;
}

export type MessageModalProps = {
  isOpen: boolean;
  title?: string;
  children?: ReactNode;
  onSubmit?: () => void;
  disableSubmit?: () => boolean;
  submitButtonName?: string;
  cancelButtonName?: string;
  onClose: () => void;
  isHard?: boolean;
};
