import React, { useState, useEffect, useRef } from "react";

import { Box } from "@mui/material";

import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { useBoard } from "~/providers/BoardProvider";

interface CardPreviewBoardProps {
  src: string;
  width?: number;
  height?: number;
  onClose?: () => void; // Nouvelle prop pour gérer la fermeture
}

export const containerStyle = {
  width: "100%",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export const clickableOverlayStyle = {
  position: "absolute",
  cursor: "pointer",
  zIndex: 1,
  transformOrigin: "top left",
  top: 0,
  left: 0,
};

export const iframeStyle = {
  transformOrigin: "top left",
  pointerEvents: "none",
  position: "absolute",
  top: 0,
  left: 0,
};

export const loadingContainerStyle = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bgcolor: "grey.50",
};

export const loadingTextStyle = {
  color: "text.secondary",
};

const CardPreviewBoard: React.FC<CardPreviewBoardProps> = ({
  src,
  width = 1920,
  height = 1080,
  onClose,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [containerHeight, setContainerHeight] = useState(0);
  const { closeActiveCardAction } = useBoard();

  const updateScale = () => {
    const iframe = iframeRef.current;
    const container = containerRef.current;
    const overlay = overlayRef.current;
    if (!iframe || !container || !overlay) return;

    const containerWidth = container.clientWidth;
    const viewportHeight = window.innerHeight;
    const maxHeight = viewportHeight * 0.4;

    const scaleByWidth = containerWidth / width;
    const scaleByHeight = maxHeight / height;
    const finalScale = Math.min(scaleByWidth, scaleByHeight);

    const scaledHeight = height * finalScale;

    // Calculate centered position
    const horizontalOffset = (containerWidth - width * finalScale) / 2;

    setContainerHeight(scaledHeight);
    container.style.height = `${scaledHeight}px`;

    const transform = `translate(${horizontalOffset}px, 0) scale(${finalScale})`;

    // Position and scale the iframe
    iframe.style.transform = transform;
    iframe.style.width = `${width}px`;
    iframe.style.height = `${height}px`;

    // Apply same transformation to overlay
    overlay.style.cssText = iframe.style.cssText;
    overlay.style.visibility = "visible";
    overlay.style.pointerEvents = "auto";
    overlay.style.cursor = "pointer";
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateScale);
    });

    resizeObserver.observe(container);

    const handleResize = () => requestAnimationFrame(updateScale);
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const hideHeader = () => {
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
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    updateScale();
    hideHeader();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      window.open(src, "_blank");
    } else if (e.button === 0) {
      closeActiveCardAction(BOARD_MODAL_TYPE.CARD_PREVIEW);
      if (onClose) {
        onClose();
      }
      window.location.href = src;
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        ...containerStyle,
        height: containerHeight ? `${containerHeight}px` : "auto",
        maxHeight: "40vh",
      }}
    >
      <Box
        ref={overlayRef}
        sx={clickableOverlayStyle}
        onClick={handleOverlayClick}
      />
      <iframe
        ref={iframeRef}
        src={src}
        scrolling="no"
        style={
          {
            ...iframeStyle,
            visibility: isLoading ? "hidden" : "visible",
          } as React.CSSProperties
        }
        onLoad={handleIframeLoad}
        title="Scaled content"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
      {isLoading && (
        <Box sx={loadingContainerStyle}>
          <Box sx={loadingTextStyle}>Chargement...</Box>
        </Box>
      )}
    </Box>
  );
};

export default CardPreviewBoard;
