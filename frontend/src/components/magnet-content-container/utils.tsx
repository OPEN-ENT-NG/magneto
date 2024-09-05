import { MagnetContentAudio } from "../magnet-content-audio/MagnetContentAudio";
import { MagnetContentImageDisplay } from "../magnet-content-image-display/MagnetContentImageDisplay";
import { MagnetContentSvgDisplay } from "../magnet-content-svg-display/MagnetContentSvgDisplay";
import { MagnetContentText } from "../magnet-content-text/magnetContentText";
import { EXTENSION_TYPE } from "~/core/enums/extension-type.enum";
import { RESOURCE_TYPE } from "~/core/enums/resource-type.enum";
import { Card } from "~/models/card.model";

export const redirect = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};
export const onClick = (magnet: Card) => {
  const magnetType = magnet.resourceType as RESOURCE_TYPE;
  switch (magnetType) {
    case RESOURCE_TYPE.VIDEO:
    case RESOURCE_TYPE.LINK:
      return redirect(magnet.resourceUrl);
    case RESOURCE_TYPE.TEXT:
      return null;
    case RESOURCE_TYPE.IMAGE:
      return null;
    case RESOURCE_TYPE.AUDIO:
      return null;
  }
};

export const displayContentByType = (magnet: Card) => {
  const magnetType = magnet.resourceType as RESOURCE_TYPE;
  switch (magnetType) {
    case RESOURCE_TYPE.VIDEO:
      return <MagnetContentImageDisplay url={magnet.resourceUrl} />;
    case RESOURCE_TYPE.LINK:
      return <MagnetContentSvgDisplay extension={EXTENSION_TYPE.LINK} />;
    case RESOURCE_TYPE.TEXT:
      return <MagnetContentText text={magnet.description} />;
    case RESOURCE_TYPE.IMAGE:
      return <MagnetContentImageDisplay defaultImageSrc={magnet.resourceUrl} />;
    case RESOURCE_TYPE.AUDIO:
      return (
        <MagnetContentAudio
          ressourceId={magnet.resourceId}
          type={magnet.metadata.contentType}
        />
      );
    case RESOURCE_TYPE.FILE:
      return (
        <MagnetContentSvgDisplay
          extension={magnet.metadata.contentType.split("/")[1] as EXTENSION_TYPE}
        />
      );
  }
};
