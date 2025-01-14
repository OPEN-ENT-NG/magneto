export interface ScaledIframeProps {
  src: string;
  width?: number;
  height?: number;
}

export interface UseScaledIframeProps {
  width?: number;
  height?: number;
}

export interface UseScaledIframeReturn {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  containerHeight: number;
  handleIframeLoad: () => void;
  iframeStyle: React.CSSProperties;
  containerStyle: React.CSSProperties;
}
