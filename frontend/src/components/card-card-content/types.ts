import { Card } from "~/models/card.model";

export interface CardCardContentProps {
  title: string;
  zoomLevel: number;
  resourceType: string;
  card: Card;
}
