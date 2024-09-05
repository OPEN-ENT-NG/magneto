import { FC, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import Icon from "@mdi/react";
import { mdiMinus, mdiPlus } from "@mdi/js";
import "./ZoomComponent.scss";

interface ZoomComponentProps {
  opacity?: string;
  zoomLevel: number;
  zoomMaxLevel: number; //e.g. if zoomLevels is 3, there will be 4 zoom values accessible : 0, 1, 2, 3
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  label?: string;
}

export const ZoomComponent: FC<ZoomComponentProps> = ({
  opacity = "100%",
  zoomLevel,
  zoomMaxLevel,
  zoomIn,
  zoomOut,
  resetZoom,
  label = "Zoom",
}: ZoomComponentProps) => {

  useEffect(() => {
    console.log(zoomLevel);
  }, [zoomLevel]);

  return (
    <div className={`zoom`} style={{'opacity': `var(${opacity})`}}>
      <div
        role="button"
        className={`zoom-minus ${zoomLevel === 0 ? "zoom-minus-disabled" : ""}`}
        onClick={zoomOut}
      >
        <Icon path={mdiMinus} size={2} />
        <i className="magneto-minus"></i>
      </div>
      <div className="zoom-line1"></div>
      <div className="zoom-label" role="button" onClick={resetZoom}>
        {label}
      </div>
      <div className="zoom-line2"></div>
      <div
        role="button"
        className={`zoom-plus ${
          zoomLevel === zoomMaxLevel ? "zoom-plus-disabled" : ""
        }`}
        onClick={zoomIn}
      >
        <Icon path={mdiPlus} size={2} />
      </div>
    </div>
  );
};
