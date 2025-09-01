import { FC } from "react";

import { useEdificeClient, useEdificeIcons } from "@edifice.io/react";

import { StyledAppIcon, StyledBoxSvg } from "./style";
import { CardContentSvgDisplayProps } from "./types";
import { ScaledIframe } from "../card-content-board/CardContentBoard";
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
  url,
  isPreview = false,
}) => {
  const { getIconCode } = useEdificeIcons();
  const { currentApp } = useEdificeClient();

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
      const appName = extractFirstSegment(url ?? "");
      const icon = getIconCode(appName);

      return (
        <>
          {icon ? (
            icon === "magneto" ? (
              <StyledAppIcon isPreview={isPreview} app={currentApp} />
            ) : (
              <StyledAppIcon
                isPreview={isPreview}
                app={{
                  address: `/${appName}`,
                  icon: appName,
                  name: `${capFirstLetter(appName)}`,
                  scope: [],
                  display: false,
                  displayName: "",
                  isExternal: false,
                }}
              />
            )
          ) : (
            <DefaultLinkIcon />
          )}
        </>
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

  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    return <ScaledIframe src={url} />;
  }

  return (
    <StyledBoxSvg isPreview={isPreview}>
      {getSvgByExtension(extension)}
    </StyledBoxSvg>
  );
};
