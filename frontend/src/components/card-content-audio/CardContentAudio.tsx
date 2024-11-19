/* eslint-disable jsx-a11y/media-has-caption */
import { FC } from "react";

import { AudioWrapper } from "./style";
import { CardContentAudioProps } from "./types";
import { RootsConst } from "~/core/constants/roots.const";

export const CardContentAudio: FC<CardContentAudioProps> = ({
  ressourceId,
  type,
  isPreview = false,
}) => {
  return (
    <AudioWrapper isPreview={isPreview}>
      <audio
        controls
        preload="metadata"
        src={`${RootsConst.workspace}${ressourceId}`}
      >
        <source src={`${RootsConst.workspace}${ressourceId}`} type={type} />
      </audio>
    </AudioWrapper>
  );
};
