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
import { AppIcon } from "@edifice-ui/react";

export const CardContentSvgDisplay: FC<CardContentSvgDisplayProps> = ({
  extension,
  url,
}) => {
  const getSvgByExtension = (extension: string): React.ReactElement => {
    const lowerExt = extension.toLowerCase();

    const extractFirstSegment = (url: string) => {
      const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
      const segments = cleanUrl.split("/");
      return segments[0].split(/[#?]/)[0];
    };

    const capFirstLetter = (string: string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    if (lowerExt === "link") {
      const appName = extractFirstSegment(url);
      console.log(appName);
      return (
        <Box
          sx={{
            ...svgWrapperStyle,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <AppIcon
            app={{
              address: `/${appName}`,
              icon: `${appName}-large`,
              name: `${capFirstLetter(appName)}`,
              scope: [],
              display: false,
              displayName: "",
              isExternal: false,
            }}
            size="160"
          />
        </Box>
      );
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
