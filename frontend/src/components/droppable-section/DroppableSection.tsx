import { FC } from "react";

import { useDroppable } from "@dnd-kit/core";

import { SectionWrapper } from "./style";
import { DroppableSectionProps } from "./types";

export const DroppableSection: FC<DroppableSectionProps> = ({
  id,
  noCards = false,
  isLast = false,
  children,
}) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <SectionWrapper ref={setNodeRef} noCards={noCards} isLast={isLast}>
      {children}
    </SectionWrapper>
  );
};
