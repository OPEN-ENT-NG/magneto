import { MediaLibraryType } from "@edifice.io/react";

export interface VideoPlayerProps {
  modifyFile: (type: MediaLibraryType) => void;
}
