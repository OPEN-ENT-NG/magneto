import { FC, useRef, useState, useEffect } from "react";

import { Box, Typography } from "@mui/material";

import {
  captionStyle,
  descriptionStyle,
  imgContentWrapper,
  ResponsiveImage,
} from "./style";
import { PreviewContentImageProps } from "./types";
import { CardContentText } from "../card-content-text/cardContentText";
import { Tooltip } from "../tooltip/Tooltip";

export const PreviewContentImage: FC<PreviewContentImageProps> = ({ card }) => {
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
    <Box sx={imgContentWrapper}>
      <Box
        sx={{
          display: "inline-block",
          maxWidth: "100%",
        }}
      >
        <ResponsiveImage src={`${card.resourceUrl}`} alt="" />
      </Box>

      {isOverflowing ? (
        <Tooltip title={card.caption} placement="bottom-start" width={"60rem"}>
          <Typography ref={captionRef} sx={captionStyle}>
            {card.caption}
          </Typography>
        </Tooltip>
      ) : (
        <Typography ref={captionRef} sx={captionStyle}>
          {card.caption}
        </Typography>
      )}

      <Typography sx={descriptionStyle}>
        <CardContentText text={card.description} />
      </Typography>
    </Box>
  );
};
