import { ReactNode } from "react";

export type DropDownListItem = {
  primary: ReactNode;
  secondary: ReactNode;
  OnClick: () => void;
  divider?: boolean;
};

export type Position = "bottom-right" | "right-top";

export interface DropDownListProps {
  anchorEl: HTMLElement;
  items: DropDownListItem[];
  open: boolean;
  onClose: () => void;
  position?: Position;
  menuOffset?: number;
}
