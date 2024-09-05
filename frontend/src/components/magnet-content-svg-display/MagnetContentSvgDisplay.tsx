import { FC } from "react";

import { Box } from "@mui/material";

import { svgWrapperStyle } from "./style";
import { MagnetContentSvgDisplayProps } from "./types";
import { DefaultLinkIcon } from "../SVG/DefaultLinkIcon";
import { EXTENSION_TYPE } from "~/core/enums/extension-type.enum";

export const MagnetContentSvgDisplay: FC<MagnetContentSvgDisplayProps> = ({
  extension,
}) => {
  const getSvgByExtension = (extension: EXTENSION_TYPE) => {
    switch (extension) {
      case EXTENSION_TYPE.LINK:
        return <DefaultLinkIcon />;
    }
    // case EXTENSION_TYPE.PDF:
    //   return
  };

  return <Box sx={svgWrapperStyle}>{getSvgByExtension(extension)}</Box>;
};
