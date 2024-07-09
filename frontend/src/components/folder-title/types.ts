import { ReactNode } from "react";

export interface FolderTitleProps {
  text: string;
  SVGLeft?: ReactNode | null;
  SVGRight?: ReactNode | null;
  position?: "start" | "middle" | "end";
}
