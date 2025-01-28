import { FC, useEffect } from "react";

import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import { loadingContainerStyle, loadingTextStyle } from "./style";
import { ScaledIframeProps } from "./types";
import { useScaledIframe } from "./useScaledIframe";

export const ScaledIframe: FC<ScaledIframeProps> = ({
  src,
  width = 1920,
  height = 1080,
}) => {
  const {
    iframeRef,
    containerRef,
    isLoading,
    handleIframeLoad,
    iframeStyle,
    containerStyle,
  } = useScaledIframe({ width, height });

  const { t } = useTranslation("magneto");
  //fix me better
  useEffect(() => {
    const toasterContainer = document.querySelector(".toaster-container");
    const hasIframeClass = document.querySelector(".isIframe") !== null;

    if (hasIframeClass && toasterContainer) {
      toasterContainer.remove();
    }
  }, [src]);

  return (
    <Box ref={containerRef} sx={containerStyle}>
      <iframe
        ref={iframeRef}
        src={src}
        scrolling="no"
        style={iframeStyle}
        onLoad={handleIframeLoad}
        title="Scaled content"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
      {isLoading && (
        <Box sx={loadingContainerStyle}>
          <Box sx={loadingTextStyle}>{t("magneto.loading")}</Box>
        </Box>
      )}
    </Box>
  );
};
