import { VIDEO_SOURCE } from "./types";
import { isPeerTubeUrl } from "../card-content-image-display/utils";

export const getVideoSource = (url: string): VIDEO_SOURCE | null => {
  if (url.includes("vimeo")) return VIDEO_SOURCE.VIMEO;
  if (url.includes("dailymotion")) return VIDEO_SOURCE.DAILYMOTION;
  if (url.includes("youtube.com") || url.includes("youtu.be"))
    return VIDEO_SOURCE.YOUTUBE;
  if (isPeerTubeUrl(url)) return VIDEO_SOURCE.PEERTUBE;
  return null;
};

export const getDailymotionId = (url: string): string | undefined => {
  const playerMatch = url.match(/[?&]video=([^&]+)/);
  if (playerMatch) {
    return playerMatch[1];
  }

  const pathId = url.split("/").pop()?.split("?")[0];
  if (pathId) {
    return pathId;
  }

  return undefined;
};
