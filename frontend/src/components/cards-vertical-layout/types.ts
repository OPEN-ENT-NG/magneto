export interface SectionWrapperProps {
  sectionNumber?: number;
  isLast?: boolean;
  isDragging?: boolean;
}

export type CardDisplayProps = {
  zoomLevel: number;
  canComment: boolean;
  displayNbFavorites: boolean;
};
