import { FC } from "react";

import { Box } from "@mui/material";

import { svgWrapperStyle } from "./style";
import { CardContentSvgDisplayProps } from "./types";
import { AudioIcon } from "../SVG/AudioIcon";
import { DefaultIcon } from "../SVG/DefaultIcon";
import { DefaultLinkIcon } from "../SVG/DefaultLinkIcon";
import { ImageIcon } from "../SVG/ImageIcon";
import { PdfIcon } from "../SVG/PdfIcon";
import { SheetIcon } from "../SVG/SheetIcon";
import { TextIcon } from "../SVG/TextIcon";
import { VideoIcon } from "../SVG/VideoIcon";
import { EXTENSION_FORMAT } from "~/core/constants/extension-format.const";

export const CardContentSvgDisplay: FC<CardContentSvgDisplayProps> = ({
  extension,
}) => {
  const getSvgByExtension = (extension: string): React.ReactElement => {
    const lowerExt = extension.toLowerCase();

    if (lowerExt === "link") {
      return <DefaultLinkIcon />;
    }

    const [format] =
      Object.entries(EXTENSION_FORMAT).find(([, extensions]) =>
        extensions.includes(lowerExt),
      ) || [];

    switch (format) {
      case "TEXT":
        return <TextIcon />;
      case "IMAGE":
        return <ImageIcon />;
      case "VIDEO":
        return <VideoIcon />;
      case "AUDIO":
        return <AudioIcon />;
      case "SHEET":
        return <SheetIcon />;
      case "PDF":
        return <PdfIcon />;
      default:
        return <DefaultIcon />;
    }
  };

  return <Box sx={svgWrapperStyle}>{getSvgByExtension(extension)}</Box>;
};
