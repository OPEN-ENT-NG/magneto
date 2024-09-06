export interface MagnetContentImageDisplayProps {
  url?: string;
  defaultImageSrc?: string;
}

export type UrlParser = (url: URL) => string | null;
