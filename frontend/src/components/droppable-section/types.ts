import { ReactNode } from "react";

export interface DroppableSectionProps {
    id: string;
    children: ReactNode;
    noCards?: boolean;
    isLast?: boolean;
  }

export interface SectionWrapperProps {
    noCards?: boolean;
    isLast?: boolean;
  }