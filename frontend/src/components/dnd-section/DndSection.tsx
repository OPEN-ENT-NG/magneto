import { FC } from "react";

import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { SectionWrapper } from "./style";
import { DndSectionProps } from "./types";
import { useSortable } from "@dnd-kit/sortable";

export const DndSection: FC<DndSectionProps> = ({
  id,
  children,
  sectionType,
  dndType,
  isLast = false,
  noCards = false,
  sectionNumber,
}) => {
  let style = {};


  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef: sortableNode,
    transform,
    transition,
  } = useSortable({ id });

  style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  const { setNodeRef: droppableNode } = useDroppable({ id });

  const getNode = () => {
    switch(dndType) {
        case "sortable":
            return sortableNode;
        case "droppable":
            return droppableNode;
    }
  }

  return (
    <SectionWrapper
      ref={getNode}
      noCards={noCards}
      isLast={isLast}
      sectionNumber={sectionNumber}
      sectionType={sectionType}
      isDragging={isDragging}
      style={style}
      {...attributes}
      {...listeners} 
    >
      {children}
    </SectionWrapper>
  );
};
