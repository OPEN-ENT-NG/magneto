import { FC, useEffect, useRef, useState } from "react";

import { Box, Typography } from "@mui/material";

import { captionStyle, contentWrapper } from "./style";
import { PreviewCaptionAndDescProps } from "./types";
import { CardContentText } from "../card-content-text/cardContentText";
import { Tooltip } from "../tooltip/Tooltip";

export const PreviewCaptionAndDesc: FC<PreviewCaptionAndDescProps> = ({
  caption,
  description,
}) => {
  const captionRef = useRef<HTMLElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (captionRef.current) {
        setIsOverflowing(
          captionRef.current.scrollWidth > captionRef.current.clientWidth,
        );
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  return (
    <Box sx={contentWrapper}>
      {isOverflowing ? (
        <Tooltip title={caption} placement="bottom-start" width={"60rem"}>
          <Typography ref={captionRef} sx={captionStyle}>
            {caption}
          </Typography>
        </Tooltip>
      ) : (
        <Typography ref={captionRef} sx={captionStyle}>
          {caption}
        </Typography>
      )}
        <CardContentText text={description} />
    </Box>
  );
};
