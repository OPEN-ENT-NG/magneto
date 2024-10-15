import { MediaLibraryType } from "@edifice-ui/react";
import { MediaProps } from "../board-view/types";

export interface ImageContainerProps {
  media: MediaProps | null;
  handleClickMedia: (type: MediaLibraryType) => void;
}
