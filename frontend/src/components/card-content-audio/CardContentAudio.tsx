/* eslint-disable jsx-a11y/media-has-caption */
import { FC } from "react";

import { Box } from "@mui/material";

import { audioWrapperStyle } from "./style";
import { CardContentAudioProps } from "./types";
import { RootsConst } from "~/core/constants/roots.const";

export const CardContentAudio: FC<CardContentAudioProps> = ({
  ressourceId,
  type,
}) => {
  return (
    <Box sx={audioWrapperStyle}>
      <audio
        controls
        preload="metadata"
        src={`${RootsConst.workspace}${ressourceId}`}
      >
        <source src={`${RootsConst.workspace}${ressourceId}`} type={type} />
      </audio>
    </Box>
  );
};
