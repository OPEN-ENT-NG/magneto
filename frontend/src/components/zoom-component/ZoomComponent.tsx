import { FC, useState } from "react";

import { useTranslation } from "react-i18next";
import Icon from "@mdi/react";
import { mdiMinus, mdiPlus } from "@mdi/js";
import "./ZoomComponent.scss";

interface ZoomComponentProps {
  opacity: string;
  zoomMaxLevel: number; //e.g. if zoomLevels is 3, there will be 4 zoom values accessible : 0, 1, 2, 3
  zoomInitLevel: number;
}

export const ZoomComponent: FC<ZoomComponentProps> = ({
  opacity,
  zoomMaxLevel,
  zoomInitLevel,
}: ZoomComponentProps) => {
  const { t } = useTranslation("magneto");
  const [zoomLevel, setZoomLevel] = useState<number>(3);

  const zoomIn = () => {
    if (zoomLevel < zoomMaxLevel) setZoomLevel(zoomLevel + 1);
  };

  const zoomOut = () => {
    if (zoomLevel > 0) setZoomLevel(zoomLevel - 1);
  };

  const resetZoom = () => {
    setZoomLevel(zoomInitLevel);
  };

  return (
    <div className={`zoom ${!!opacity ? opacity : ""}`}>
      <div
        className={`zoom-minus ${zoomLevel === 0 ? "zoom-minus-disabled" : ""}`}
        onClick={() => zoomOut()}
      >
        <Icon path={mdiMinus} size={2} />
        <i className="magneto-minus"></i>
      </div>
      <div className="zoom-line1"></div>
      <div className="zoom-label" onClick={() => resetZoom()}>
        {t("magneto.zoom")}
      </div>
      <div className="zoom-line2"></div>
      <div
        className={`zoom-plus ${
          zoomLevel === zoomMaxLevel ? "zoom-plus-disabled" : ""
        }`}
        onClick={() => zoomIn()}
      >
        <Icon path={mdiPlus} size={2} />
      </div>
    </div>
  );
};
