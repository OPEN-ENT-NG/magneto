import { useState, useEffect, FC } from "react";

import { CardMedia } from "@mui/material";

import { imgStyle, videoImgStyle } from "./style";
import { MagnetContentImageDisplayProps } from "./types";
import { getVideoThumbnailUrl } from "./utils";

export const MagnetContentImageDisplay: FC<MagnetContentImageDisplayProps> = ({
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
      {!!url && (
        <CardMedia
          component="img"
          image={imageUrl}
          alt="Video thumbnail"
          sx={videoImgStyle}
        />
      )}
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
