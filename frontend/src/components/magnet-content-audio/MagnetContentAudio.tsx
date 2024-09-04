import { FC } from "react";
import { MagnetContentAudioProps } from "./types";
import { Box } from "@mui/material";
import { audioWrapperStyle } from "./style";
import { RootsConst } from "~/core/constants/roots.const";

export const MagnetContentAudio: FC<MagnetContentAudioProps> = ({
  ressourceId,
  type,
}) => {
  return (
    <Box sx={audioWrapperStyle}>
      <audio
        controls
        preload="none"
        src={`${RootsConst.workspace}${ressourceId}`}
      >
        <source src={`${RootsConst.workspace}${ressourceId}`} type={type} />
      </audio>
    </Box>
  );
};
