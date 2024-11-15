import { PreviewContentImage } from "../preview-content-image/PreviewContentImage";
import { RESOURCE_TYPE } from "~/core/enums/resource-type.enum";
import { Card } from "~/models/card.model";

export const displayPreviewContentByType = (card: Card) => {
  const cardType = card.resourceType as RESOURCE_TYPE;
  switch (cardType) {
    case RESOURCE_TYPE.VIDEO:
      return null;
    case RESOURCE_TYPE.LINK:
      return null;
    case RESOURCE_TYPE.TEXT:
      return null;
    case RESOURCE_TYPE.IMAGE:
      return <PreviewContentImage card={card} />;
    case RESOURCE_TYPE.AUDIO:
      return null;
    case RESOURCE_TYPE.FILE:
      return null;
    default:
      return null;
  }
};
