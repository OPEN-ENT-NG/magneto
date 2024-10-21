/* eslint-disable jsx-a11y/media-has-caption */
import { useState, useEffect, FC } from "react";

import { CardMedia } from "@mui/material";

import { imgStyle, videoImgStyle, videoStyle } from "./style";
import { CardContentImageDisplayProps } from "./types";
import { getVideoThumbnailUrl } from "./utils";

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
        ) : (
          <CardMedia
            component="img"
            image={imageUrl}
            alt="Video thumbnail"
            sx={videoImgStyle}
          />
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
