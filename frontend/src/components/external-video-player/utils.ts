import { VIDEO_SOURCE } from "./types";
import { isPeerTubeUrl } from "../card-content-image-display/utils";

export const getVideoSource = (url: string): VIDEO_SOURCE | null => {
  if (isPeerTubeUrl(url)) return VIDEO_SOURCE.PEERTUBE;
  if (url.includes("vimeo")) return VIDEO_SOURCE.VIMEO;
  if (url.includes("dailymotion")) return VIDEO_SOURCE.DAILYMOTION;
  if (url.includes("youtube.com") || url.includes("youtu.be"))
    return VIDEO_SOURCE.YOUTUBE;
  return null;
};
