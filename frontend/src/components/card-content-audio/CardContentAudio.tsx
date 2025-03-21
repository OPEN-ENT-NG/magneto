import { FC } from "react";

import { AudioWrapper } from "./style";
import { CardContentAudioProps } from "./types";
import { RootsConst } from "~/core/constants/roots.const";
import { useBoard } from "~/providers/BoardProvider";

export const CardContentAudio: FC<CardContentAudioProps> = ({
  ressourceId,
  type,
  isPreview = false,
}) => {
  const { isExternalView } = useBoard();
  return (
    <AudioWrapper isPreview={isPreview}>
      <audio
        controls
        preload="metadata"
        src={`${
          isExternalView ? RootsConst.workspacePublic : RootsConst.workspace
        }${ressourceId}`}
      >
        <source
          src={`${
            isExternalView ? RootsConst.workspacePublic : RootsConst.workspace
          }${ressourceId}`}
          type={type}
        />
      </audio>
    </AudioWrapper>
  );
};
