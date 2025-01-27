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

export const extractThumbnailFromIframe = (url: string): Promise<string> => {
  console.log("[Debug] Starting extractThumbnailFromIframe with URL:", url);

  return new Promise((resolve, reject) => {
    console.log("[Debug] Creating iframe element");
    const iframe = document.createElement("iframe");

    // Ajouter les attributs pour le cross-origin
    iframe.setAttribute("sandbox", "allow-same-origin allow-scripts");
    iframe.setAttribute("loading", "eager");

    // Style pour cacher l'iframe
    iframe.style.cssText =
      "position: absolute; visibility: hidden; width: 0; height: 0;";

    // Set a timeout in case something goes wrong
    console.log("[Debug] Setting up timeout");
    const timeout = setTimeout(() => {
      console.log("[Debug] Timeout triggered - removing iframe");
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      reject("Timeout waiting for iframe to load");
    }, 5000);

    console.log("[Debug] Setting up onload handler");
    iframe.onload = () => {
      console.log("[Debug] Iframe loaded");
      try {
        // On attend un peu que le contenu soit chargé
        setTimeout(() => {
          try {
            console.log("[Debug] Attempting to access iframe content");
            console.log(
              "[Debug] iframe readyState:",
              iframe.contentDocument?.readyState,
            );
            console.log(
              "[Debug] iframe location:",
              iframe.contentWindow?.location?.href,
            );

            const videoElement =
              iframe.contentDocument?.getElementById("podvideoplayer");
            console.log("[Debug] Video element found:", !!videoElement);

            const metaThumbnail = iframe.contentDocument?.querySelector(
              'meta[itemprop="thumbnailUrl"]',
            );
            console.log("[Debug] Meta thumbnail found:", !!metaThumbnail);

            // Essayer d'abord le meta tag
            let thumbnailUrl = metaThumbnail?.getAttribute("content");

            // Si pas de meta tag, essayer l'attribut poster de la vidéo
            if (!thumbnailUrl && videoElement) {
              thumbnailUrl = videoElement.getAttribute("poster");
            }

            console.log("[Debug] Thumbnail URL found:", thumbnailUrl);

            if (thumbnailUrl) {
              if (thumbnailUrl.startsWith("//")) {
                const urlObj = new URL(url);
                resolve(`${urlObj.protocol}${thumbnailUrl}`);
              } else {
                resolve(thumbnailUrl);
              }
            } else {
              reject("No thumbnail found in iframe");
            }
          } catch (innerError) {
            console.error(
              "[Debug] Error accessing iframe content:",
              innerError,
            );
            reject(innerError);
          } finally {
            clearTimeout(timeout);
            if (iframe.parentNode) {
              document.body.removeChild(iframe);
            }
          }
        }, 500); // Petit délai pour laisser le contenu se charger
      } catch (error) {
        console.error("[Debug] Error in onload handler:", error);
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
        reject(error);
      }
    };

    console.log("[Debug] Setting iframe src and appending to document");
    // Ajouter l'iframe au document
    document.body.appendChild(iframe);
    // Définir la source après avoir ajouté l'iframe au document
    iframe.src = url;
    console.log("[Debug] Iframe appended to document - waiting for load");
  });
};
export const formatPeerTubeUrl = async (url: string): Promise<string> => {
  try {
    // First try to extract thumbnail from HTML metadata
    const thumbnailUrl = await extractThumbnailFromIframe(url);
    console.log("thumbnailUrl", thumbnailUrl);
    if (thumbnailUrl) {
      return thumbnailUrl;
    }

    // If that fails, fall back to the API approach
    const urlObj = new URL(url);
    const host = `${urlObj.protocol}//${urlObj.hostname}`;
    const pathSegments = urlObj.pathname.split("/").filter(Boolean);
    const id = pathSegments[pathSegments.length - 1];

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
