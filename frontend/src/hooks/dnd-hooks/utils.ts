import { CardMap, SectionMap } from "./types";
import { Section } from "~/providers/BoardProvider/types";

export const createSectionMap = (sections: Section[]): SectionMap =>
  sections.reduce(
    (acc, section) => ({ ...acc, [section._id]: section }),
    {} as SectionMap,
  );

export const createCardMap = (sections: Section[]): CardMap =>
  sections.reduce((acc, section) => {
    section.cards.forEach((card) => {
      acc[card.id] = { card, sectionId: section._id };
    });
    return acc;
  }, {} as CardMap);
