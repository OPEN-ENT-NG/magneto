import { ReactNode } from "react";

export type DropDownListItem = {
  primary: ReactNode;
  secondary: ReactNode;
  OnClick: () => void;
  divider?: boolean;
};

export interface DropDownListProps {
  items: DropDownListItem[];
  onClose: () => void;
}
