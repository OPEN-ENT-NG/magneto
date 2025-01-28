import { UrlParser } from "./types";

export const VIDEO_PLATFORMS = {
  vimeo: "https://vimeo.com/api/oembed.json?url=",
  dailymotion: "https://www.dailymotion.com/thumbnail/video/{id}",
  youtube: "https://img.youtube.com/vi/{id}/hqdefault.jpg",
  peertube: "{host}/api/v1/videos/{id}",
};

export const isPeerTubeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    return (
      path.includes("/w/") ||
      path.includes("/videos/") ||
      path.includes("/video/") ||
      path.includes("/v/")
    );
  } catch {
    return false;
  }
};


export const formatPeerTubeUrl = async (url: string): Promise<string> => {
  try {
    const urlObj = new URL(url);
    const host = `${urlObj.protocol}//${urlObj.hostname}`;
    const pathSegments = urlObj.pathname.split("/").filter(Boolean);
    const id = pathSegments[pathSegments.length - 1];
console.log("id", id);

    if (!id) {
      throw new Error("Unable to extract video ID");
    }

    const apiUrl = `${host}/api/v1/videos/${id}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return `${host}${data.thumbnailPath}`;
  } catch (error) {
    console.error("Error fetching video thumbnail:", error);
    return "";
  }
};

export const formatVimeoUrl = async (url: string) => {
  const response = await fetch(VIDEO_PLATFORMS.vimeo + url);
  const data = await response.json();
  return data.thumbnail_url;
};

export const formatDailymotionUrl = (url: string) => {
  const id = url.split("/").pop();
  if (id) return VIDEO_PLATFORMS.dailymotion.replace("{id}", id);
};

const urlParsers: Record<string, UrlParser> = {
  "youtube.com": (url: URL) => {
    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/")[2]?.split("?")[0] ?? null;
    }
    return url.searchParams.get("v");
  },
  "youtu.be": (url: URL) => url.pathname.split("/")[1]?.split("?")[0] ?? null,
  "youtube-nocookie.com": (url: URL) => {
    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/")[2]?.split("?")[0] ?? null;
    }
    return null;
  },
};

const getYoutubeId = (url: URL): string | null => {
  const parser = Object.entries(urlParsers).find(([domain]) =>
    url.hostname.includes(domain),
  );
  return parser ? parser[1](url) : null;
};

export const formatYoutubeUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    const id = getYoutubeId(parsedUrl);
    return id ? VIDEO_PLATFORMS.youtube.replace("{id}", id) : "";
  } catch {
    console.error("Invalid URL:", url);
    return "";
  }
};

export const getVideoThumbnailUrl = async (url: string) => {
  console.log("url", url);

  if (isPeerTubeUrl(url)) {
    return formatPeerTubeUrl(url);
  }
  if (url.includes("vimeo")) return formatVimeoUrl(url);
  if (url.includes("dailymotion")) return formatDailymotionUrl(url);
  if (url.includes("youtube.com") || url.includes("youtu.be"))
    return formatYoutubeUrl(url);
  return "";
};
