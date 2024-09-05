import { FC, useEffect } from "react";

import { mdiMinus, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import "./ZoomComponent.scss";

interface ZoomComponentProps {
  opacity?: number;
  zoomLevel: number;
  zoomMaxLevel: number; //e.g. if zoomLevels is 3, there will be 4 zoom values accessible : 0, 1, 2, 3
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  label?: string;
}

export const ZoomComponent: FC<ZoomComponentProps> = ({
  opacity = 1,
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
    <div className={`zoom`} style={{ opacity: opacity}}>
      <div
        role="button"
        className={`zoom-minus ${zoomLevel === 0 ? "zoom-minus-disabled" : ""}`}
        onClick={zoomOut}
        onKeyDown={() => {}}
        tabIndex={0}
      >
        <Icon path={mdiMinus} size={2} />
        <i className="magneto-minus"></i>
      </div>
      <div className="zoom-line1"></div>
      <div
        className="zoom-label"
        role="button"
        onClick={resetZoom}
        onKeyDown={() => {}}
        tabIndex={0}
      >
        {label}
      </div>
      <div className="zoom-line2"></div>
      <div
        role="button"
        className={`zoom-plus ${
          zoomLevel === zoomMaxLevel ? "zoom-plus-disabled" : ""
        }`}
        onClick={zoomIn}
        onKeyDown={() => {}}
        tabIndex={0}
      >
        <Icon path={mdiPlus} size={2} />
      </div>
    </div>
  );
};
