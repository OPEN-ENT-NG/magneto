// types/video.types.ts
import type { ReactPlayerProps } from "react-player";

export enum VIDEO_SOURCE {
  YOUTUBE = "youtube",
  VIMEO = "vimeo",
  DAILYMOTION = "dailymotion",
  PEERTUBE = "peertube",
  UNKNOWN = "unknown",
}

export interface VideoPlayerProps extends Omit<ReactPlayerProps, "config"> {
  source: VIDEO_SOURCE;
}
