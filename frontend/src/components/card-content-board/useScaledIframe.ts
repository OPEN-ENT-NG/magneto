import { useEffect, useRef, useState, useMemo, useCallback } from "react";

interface UseScaledIframeProps {
  width?: number;
  height?: number;
}

interface UseScaledIframeReturn {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  containerHeight: number;
  handleIframeLoad: () => void;
  iframeStyle: React.CSSProperties;
  containerStyle: React.CSSProperties;
}

export const useScaledIframe = ({
  width = 1920,
  height = 1080,
}: UseScaledIframeProps = {}): UseScaledIframeReturn => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState({
    containerWidth: 0,
    viewportHeight: window.innerHeight,
    containerHeight: 0,
    scale: 1,
    horizontalOffset: 0,
  });

  // Calculate the iframe scaling to always show the whole page
  const calculateScale = useCallback(() => {
    const container = containerRef.current;
    if (!container) return null;

    const containerWidth = container.clientWidth;
    const viewportHeight = window.innerHeight;
    const maxHeight = viewportHeight * 0.4;

    const scaleByWidth = containerWidth / width;
    const scaleByHeight = maxHeight / height;
    const scale = Math.min(scaleByWidth, scaleByHeight);

    const scaledHeight = height * scale;
    const horizontalOffset = (containerWidth - width * scale) / 2;

    return {
      containerWidth,
      viewportHeight,
      containerHeight: scaledHeight,
      scale,
      horizontalOffset,
    };
  }, [width, height]);

  const updateScale = useCallback(() => {
    const newDimensions = calculateScale();
    if (newDimensions) {
      setDimensions(newDimensions);
    }
  }, [calculateScale]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateScale);
    });

    resizeObserver.observe(container);

    const handleResize = () => requestAnimationFrame(updateScale);
    window.addEventListener("resize", handleResize);

    // Initial scale calculation
    updateScale();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [updateScale]);

  const hideHeader = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      let styleElement = iframeDoc.getElementById("hide-header-style");
      if (!styleElement) {
        styleElement = iframeDoc.createElement("style");
        styleElement.id = "hide-header-style";
        iframeDoc.head.appendChild(styleElement);
      }

      styleElement.textContent = `
        #root > .header:first-of-type {
          display: none !important;
        }
      `;
    } catch (error) {
      console.error("Failed to hide header:", error);
    }
  }, []);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    updateScale();
    hideHeader();
  }, [updateScale, hideHeader]);

  const iframeStyle = useMemo<React.CSSProperties>(
    () => ({
      transformOrigin: "top left",
      pointerEvents: "none",
      position: "absolute",
      top: 0,
      left: 0,
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${dimensions.horizontalOffset}px, 0) scale(${dimensions.scale})`,
      visibility: isLoading ? "hidden" : "visible",
    }),
    [width, height, dimensions.horizontalOffset, dimensions.scale, isLoading],
  );

  const containerStyle = useMemo<React.CSSProperties>(
    () => ({
      width: "100%",
      height: dimensions.containerHeight
        ? `${dimensions.containerHeight}px`
        : "auto",
      maxHeight: "40vh",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }),
    [dimensions.containerHeight],
  );

  return {
    iframeRef,
    containerRef,
    isLoading,
    containerHeight: dimensions.containerHeight,
    handleIframeLoad,
    iframeStyle,
    containerStyle,
  };
};
