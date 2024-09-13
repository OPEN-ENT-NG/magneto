export interface CardContentImageDisplayProps {
  url?: string;
  defaultImageSrc?: string;
}

export type UrlParser = (url: URL) => string | null;
