import { Card } from "~/models/card.model";
import { Section } from "~/providers/BoardProvider/types";

export type SectionMap = Record<string, Section>;
export type CardMap = Record<string, { card: Card; sectionId: string }>;

export enum DND_ITEM_TYPE {
  CARD = "card",
  SECTION = "section",
}
