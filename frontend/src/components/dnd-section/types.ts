import { ReactNode } from "react";

export interface DndSectionProps {
  id: string;
  children: ReactNode;
  sectionType: "vertical"|"horizontal";
  dndType: "sortable"|"draggable"|"droppable";
  isLast?: boolean;
  isDragging?: boolean;

  //horizontal
  noCards?: boolean;
  //vertical, 
  sectionNumber?: number;
}

export interface SectionWrapperProps {
  sectionType: "vertical"|"horizontal";
  isLast?: boolean;
  isDragging?: boolean;

  //horizontal
  noCards?: boolean;
  //vertical, mandatory
  sectionNumber?: number;
}
