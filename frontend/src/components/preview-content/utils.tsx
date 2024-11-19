import { Box } from "@mui/material";

import { redirect } from "../card-content/utils";
import { CardContentAudio } from "../card-content-audio/CardContentAudio";
import { CardContentImageDisplay } from "../card-content-image-display/CardContentImageDisplay";
import { CardContentSvgDisplay } from "../card-content-svg-display/CardContentSvgDisplay";
import { PreviewContentImage } from "../preview-content-image/PreviewContentImage";
import { RESOURCE_TYPE } from "~/core/enums/resource-type.enum";
import { Card } from "~/models/card.model";

export const displayPreviewContentByType = (card: Card) => {
  const cardType = card.resourceType as RESOURCE_TYPE;
  switch (cardType) {
    case RESOURCE_TYPE.VIDEO:
      return <CardContentImageDisplay url={card.resourceUrl} />;
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
      return <PreviewContentImage ressourceUrl={card.resourceUrl} />;
    case RESOURCE_TYPE.AUDIO:
      return (
        <CardContentAudio
          ressourceId={card.resourceId}
          type={card.metadata ? card.metadata.contentType : ""}
          isPreview
        />
      );
    case RESOURCE_TYPE.FILE:
      return null;
    default:
      return null;
  }
};
