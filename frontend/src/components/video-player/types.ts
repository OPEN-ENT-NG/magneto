import { MediaLibraryType } from "@edifice-ui/react";

export interface VideoPlayerProps {
  modifyFile: (type: MediaLibraryType) => void;
}
