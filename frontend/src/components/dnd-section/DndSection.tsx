import { FC } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { SectionWrapper } from "./style";
import { DndSectionProps } from "./types";

export const DndSection: FC<DndSectionProps> = ({
  id,
  children,
  sectionType,
  isLast = false,
  noCards = false,
  sectionNumber,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: "section",
      sectionType,
      isLast,
      noCards,
      sectionNumber,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <SectionWrapper
      ref={setNodeRef}
      style={style}
      data-type="section"
      noCards={noCards}
      isLast={isLast}
      sectionNumber={sectionNumber}
      sectionType={sectionType}
      isDragging={isDragging}
      {...attributes}
      {...listeners}
    >
      {children}
    </SectionWrapper>
  );
};
