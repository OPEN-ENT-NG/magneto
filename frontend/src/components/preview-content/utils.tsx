import { Box } from "@mui/material";

import { redirect } from "../card-content/utils";
import { CardContentAudio } from "../card-content-audio/CardContentAudio";
import { CardContentFile } from "../card-content-file/CardContentFile";
import { CardContentSvgDisplay } from "../card-content-svg-display/CardContentSvgDisplay";
import CardPreviewBoard from "../card-preview-board/CardPreviewBoard";
import { ExternalVideoPlayer } from "../external-video-player/ExternalVideoPlayer";
import { VIDEO_SOURCE } from "../external-video-player/types";
import { getVideoSource } from "../external-video-player/utils";
import { PreviewContentImage } from "../preview-content-image/PreviewContentImage";
import { RESOURCE_TYPE } from "~/core/enums/resource-type.enum";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";
import { RootsConst } from "~/core/constants/roots.const";

export const displayPreviewContentByType = (card: Card) => {
  const cardType = card.resourceType as RESOURCE_TYPE;
  const { isExternalView } = useBoard();

  const finalResourceUrl = isExternalView
    ? `${RootsConst.workspacePublic}${card.resourceId}`
    : card.resourceUrl;

  switch (cardType) {
    case RESOURCE_TYPE.VIDEO: {
      const videoSource = getVideoSource(finalResourceUrl);
      return (
        <ExternalVideoPlayer
          url={finalResourceUrl}
          source={videoSource ?? VIDEO_SOURCE.UNKNOWN}
        />
      );
    }
    case RESOURCE_TYPE.LINK:
      return (
        <Box
          onClick={() => redirect(card.resourceUrl)}
          sx={{ cursor: "pointer" }}
        >
          <CardContentSvgDisplay
            url={card.resourceUrl}
            extension="link"
            isPreview
          />
        </Box>
      );
    case RESOURCE_TYPE.TEXT:
      return null;
    case RESOURCE_TYPE.IMAGE:
      return <PreviewContentImage ressourceUrl={finalResourceUrl} />;
    case RESOURCE_TYPE.AUDIO:
      return (
        <CardContentAudio
          ressourceId={card.resourceId}
          type={card.metadata ? card.metadata.contentType : ""}
          isPreview
        />
      );
    case RESOURCE_TYPE.FILE:
      return <CardContentFile card={card} />;
    case RESOURCE_TYPE.BOARD:
      return (
        <CardPreviewBoard src={`/magneto#/board/${card.resourceUrl}/view`} />
      );
    default:
      return null;
  }
};
