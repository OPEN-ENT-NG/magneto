import { useEffect, useRef, useState } from "react";

import { Edit } from "@edifice-ui/icons";
import { IconButton } from "@edifice-ui/react";
import { Box } from "@mui/material";

import { imageStyle, mainBoxStyle, StyledIconButtonBox } from "./style";
import { ImageContainerProps } from "./types";
import { iconButtonStyle } from "../file-picker-workspace/style";
import { MEDIA_LIBRARY_TYPE } from "~/core/enums/media-library-type.enum";

export const ImageContainer = ({
  media,
  handleClickMedia,
}: ImageContainerProps) => {
  const [imageBounds, setImageBounds] = useState({ top: 0, right: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateButtonPosition = () => {
      if (imageRef.current && containerRef.current) {
        const imgRect = imageRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        setImageBounds({
          top: imgRect.top - (containerRect.top + 6),
          right: containerRect.right - (imgRect.right + 6),
        });
      }
    };

    updateButtonPosition();
    window.addEventListener("resize", updateButtonPosition);
    if (imageRef.current) {
      imageRef.current.addEventListener("load", updateButtonPosition);
    }

    return () => {
      window.removeEventListener("resize", updateButtonPosition);
      if (imageRef.current) {
        imageRef.current.removeEventListener("load", updateButtonPosition);
      }
    };
  }, [media]);
  console.log(media?.url);

  return (
    <Box ref={containerRef} sx={mainBoxStyle}>
      <img
        ref={imageRef}
        src={media?.url}
        style={imageStyle}
        alt={media?.name}
      />
      <StyledIconButtonBox imageBounds={imageBounds}>
        <IconButton
          aria-label="Edit image"
          color="tertiary"
          icon={<Edit />}
          onClick={() => handleClickMedia(MEDIA_LIBRARY_TYPE.IMAGE)}
          type="button"
          variant="ghost"
          style={iconButtonStyle}
        />
      </StyledIconButtonBox>
    </Box>
  );
};
