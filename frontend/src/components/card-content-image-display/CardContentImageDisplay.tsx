import { useState, useEffect, FC } from "react";

import { CardMedia } from "@mui/material";

import { imgStyle, videoImgStyle, videoStyle } from "./style";
import { CardContentImageDisplayProps } from "./types";
import { getVideoThumbnailUrl } from "./utils";
import { StyledBoxSvg } from "../card-content-svg-display/style";
import { DefaultVideoThumbnail } from "../SVG/DefaultVideoThumbnail";

export const CardContentImageDisplay: FC<CardContentImageDisplayProps> = ({
  url = "",
  defaultImageSrc = "",
}) => {
  const [imageUrl, setImageUrl] = useState("");

  const fetchThumbnailUrl = async () => {
    const formattedUrl = await getVideoThumbnailUrl(url);
    setImageUrl(formattedUrl);
  };

  useEffect(() => {
    if (defaultImageSrc) setImageUrl(defaultImageSrc);
    if (url) fetchThumbnailUrl();
  }, [url, defaultImageSrc]);

  return (
    <>
      {!!url &&
        (url.startsWith("/workspace/") ? (
          <video controls src={url} style={videoStyle}></video>
        ) : imageUrl ? (
          <CardMedia
            component="img"
            image={imageUrl}
            alt="Video thumbnail"
            sx={videoImgStyle}
          />
        ) : (
          <StyledBoxSvg isPreview={false}>
            <DefaultVideoThumbnail />
          </StyledBoxSvg>
        ))}
      {!!defaultImageSrc && (
        <CardMedia
          component="img"
          image={imageUrl}
          alt="Image Display"
          sx={imgStyle}
        />
      )}
    </>
  );
};
