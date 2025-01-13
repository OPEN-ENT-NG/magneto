import { MediaLibraryType } from "@edifice.io/react";

import { MediaProps } from "../board-view/types";

export interface ImageContainerProps {
  media: MediaProps | null;
  handleClickMedia: (type: MediaLibraryType) => void;
}
