export interface CardActionsProps {
  cardIsLiked: boolean;
  zoomLevel: number;
  icon: string;
  type: string;
  caption: string;
  nbOfFavorites: number;
  displayNbFavorites: boolean;
  handleFavoriteClick: () => void;
}
