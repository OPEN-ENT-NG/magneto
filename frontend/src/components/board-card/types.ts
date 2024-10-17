import { Card } from "~/models/card.model";

export interface BoardCardProps {
  card: Card;
  zoomLevel: number;
  canComment?: boolean;
  displayNbFavorites?: boolean;
}
