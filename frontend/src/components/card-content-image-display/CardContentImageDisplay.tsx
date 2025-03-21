import { useState, useEffect, FC } from "react";

import { CardMedia } from "@mui/material";

import { imgStyle, videoImgStyle, videoStyle } from "./style";
import { CardContentImageDisplayProps } from "./types";
import { getVideoThumbnailUrl } from "./utils";
import { StyledBoxSvg } from "../card-content-svg-display/style";
import { DefaultVideoThumbnail } from "../SVG/DefaultVideoThumbnail";
import { RootsConst } from "~/core/constants/roots.const";
import { useBoard } from "~/providers/BoardProvider";

export const CardContentImageDisplay: FC<CardContentImageDisplayProps> = ({
  url = "",
  defaultImageSrc = "",
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const { isExternalView } = useBoard();

  const fetchThumbnailUrl = async () => {
    const formattedUrl = await getVideoThumbnailUrl(url);
    setImageUrl(formattedUrl);
  };

  useEffect(() => {
    if (defaultImageSrc) setImageUrl(defaultImageSrc);
    if (url) fetchThumbnailUrl();
  }, [url, defaultImageSrc]);

  const renderVideoContent = () => {
    if (!url) return null;

    console.log(url);

    if (url.startsWith("/workspace/")) {
      return (
        <video
          controls
          src={
            isExternalView
              ? url.replace(RootsConst.workspace, RootsConst.workspacePublic)
              : url
          }
          style={videoStyle}
        ></video>
      );
    }

    if (imageUrl) {
      return (
        <CardMedia
          component="img"
          image={imageUrl}
          alt="Video thumbnail"
          sx={videoImgStyle}
        />
      );
    }

    return (
      <StyledBoxSvg isPreview={false}>
        <DefaultVideoThumbnail />
      </StyledBoxSvg>
    );
  };

  return (
    <>
      {!!url && renderVideoContent()}
      {!!defaultImageSrc && (
        <CardMedia
          component="img"
          image={
            isExternalView
              ? imageUrl.replace(
                  RootsConst.workspace,
                  RootsConst.workspacePublic,
                )
              : imageUrl
          }
          alt="Image Display"
          sx={imgStyle}
        />
      )}
    </>
  );
};
