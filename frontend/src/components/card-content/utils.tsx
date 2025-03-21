import { CardContentAudio } from "../card-content-audio/CardContentAudio";
import { CardContentImageDisplay } from "../card-content-image-display/CardContentImageDisplay";
import { CardContentSvgDisplay } from "../card-content-svg-display/CardContentSvgDisplay";
import { CardContentText } from "../card-content-text/cardContentText";
import { RootsConst } from "~/core/constants/roots.const";
import { RESOURCE_TYPE } from "~/core/enums/resource-type.enum";
import { Card } from "~/models/card.model";

export const redirect = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};
export const onClick = (card: Card) => {
  const cardType = card.resourceType as RESOURCE_TYPE;
  switch (cardType) {
    case RESOURCE_TYPE.VIDEO:
      if (card.resourceUrl.startsWith("/workspace/")) return null;
      else return redirect(card.resourceUrl);
    case RESOURCE_TYPE.LINK:
      return redirect(card.resourceUrl);
    case RESOURCE_TYPE.TEXT:
      return null;
    case RESOURCE_TYPE.IMAGE:
      return null;
    case RESOURCE_TYPE.AUDIO:
      return null;
    case RESOURCE_TYPE.FILE:
      return null;
  }
};

export const displayContentByType = (card: Card, src?: string) => {
  const cardType = card.resourceType as RESOURCE_TYPE;
  switch (cardType) {
    case RESOURCE_TYPE.VIDEO:
      return (
        <CardContentImageDisplay
          url={
            window.location.hash.includes("/pub/")
              ? `${RootsConst.workspacePublic}${card.resourceId}`
              : card.resourceUrl
          }
        />
      );
    case RESOURCE_TYPE.LINK:
      return <CardContentSvgDisplay url={card.resourceUrl} extension="link" />;
    case RESOURCE_TYPE.TEXT:
      return <CardContentText text={card.description} />;
    case RESOURCE_TYPE.IMAGE:
      return (
        <CardContentImageDisplay
          defaultImageSrc={
            window.location.hash.includes("/pub/")
              ? `${RootsConst.workspacePublic}${card.resourceId}`
              : card.resourceUrl
          }
        />
      );
    case RESOURCE_TYPE.AUDIO:
      return (
        <CardContentAudio
          ressourceId={card.resourceId}
          type={card.metadata ? card.metadata.contentType : ""}
        />
      );
    case RESOURCE_TYPE.FILE:
      return (
        <CardContentSvgDisplay
          extension={card.metadata ? card.metadata.extension : ""}
        />
      );
    case RESOURCE_TYPE.BOARD:
      return <CardContentImageDisplay defaultImageSrc={src} />;
  }
};
