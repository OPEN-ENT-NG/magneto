import { ReactNode } from "react";

import { HexaColor } from "@cgi-learning-hub/ui";

export interface DndSectionProps {
  id: string;
  children: ReactNode;
  sectionType: "vertical" | "horizontal";
  isLast?: boolean;
  isDragging?: boolean;
  readOnly?: boolean;
  color?: HexaColor;

  //horizontal
  noCards?: boolean;
  //vertical,
  sectionNumber?: number;
}

export interface SectionWrapperProps {
  sectionType: "vertical" | "horizontal";
  isLast?: boolean;
  isDragging?: boolean;

  //horizontal
  noCards?: boolean;
  //vertical, mandatory
  sectionNumber?: number;
}
