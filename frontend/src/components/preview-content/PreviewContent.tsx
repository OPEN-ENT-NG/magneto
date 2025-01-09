import { FC } from "react";

import { Box } from "@mui/material";

import { previewWrapper } from "./style";
import { PreviewContentProps } from "./types";
import { displayPreviewContentByType } from "./utils";
import { BoardInfosFooter } from "../board-infos-footer/BoardInfosFooter";
import { PreviewCaptionAndDesc } from "../preview-caption-and-desc/PreviewCaptionAndDesc";
import { PreviewTitle } from "../preview-title/PreviewTitle";
import { RESOURCE_TYPE } from "~/core/enums/resource-type.enum";

export const PreviewContent: FC<PreviewContentProps> = ({ card }) => {
  return (
    <Box sx={previewWrapper}>
      <PreviewTitle
        title={card.title}
        modificationDate={card.modificationDate}
        ownerName={card.ownerName}
        lastModifierName={card.lastModifierName}
      />
      {displayPreviewContentByType(card)}
      <PreviewCaptionAndDesc
        caption={card.caption}
        description={card.description}
      />
      {card.resourceType === RESOURCE_TYPE.BOARD && (
        <BoardInfosFooter card={card} />
      )}
    </Box>
  );
};
