import { FC } from "react";

import { CustomSVGProps } from "./types";

export const ImageIcon: FC<CustomSVGProps> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="100%"
    height="100%"
    viewBox="0 0 22.851549 31.61331"
  >
    <defs>
      <linearGradient
        id="gradient-1"
        gradientUnits="userSpaceOnUse"
        x1="28.597717"
        y1="20.608883"
        x2="33.694511"
        y2="16.367947"
      >
        <stop offset="0" style={{ stopColor: "#d96000", stopOpacity: 1 }} />
        <stop offset="1" style={{ stopColor: "#ff933c", stopOpacity: 0 }} />
      </linearGradient>
    </defs>

    <g transform="translate(-334.67959,-49.712309)">
      <g transform="translate(382.97852,35.720502)">
        <g transform="translate(-59.868369,-0.80250529)">
          <path
            style={{
              fill: "#ff933c",
              fillOpacity: 1,
              stroke: "none",
              strokeWidth: 4.26188,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
            d="m 13.649965,14.794317 h 14.485507 l 6.285512,6.332759 v 23.200019 c 0,1.152612 -0.927915,2.080527 -2.080527,2.080527 H 13.649965 c -1.152612,0 -2.080527,-0.927915 -2.080527,-2.080527 V 16.874844 c 0,-1.152612 0.927915,-2.080527 2.080527,-2.080527 z"
          />
          <path
            style={{
              opacity: 0.762238,
              fill: "url(#gradient-1)",
              stroke: "none",
              strokeWidth: 2.235,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
            d="m 34.420987,21.127077 -4.885447,0.01779 c -0.996393,0.0036 -1.405545,-0.706498 -1.405545,-1.662989 l 0.0054,-4.687566 z"
          />
        </g>
        <path
          style={{ fill: "#ffffff", strokeWidth: 0.680335 }}
          d="m -39.326168,30.753541 1.700842,2.041007 2.381175,-3.061512 3.061511,4.082016 h -9.524701 m 10.885374,0.680335 v -9.524701 c 0,-0.755175 -0.612303,-1.360673 -1.360673,-1.360673 h -9.524701 a 1.3606719,1.3606719 0 0 0 -1.360673,1.360673 v 9.524701 a 1.3606719,1.3606719 0 0 0 1.360673,1.360673 h 9.524701 a 1.3606719,1.3606719 0 0 0 1.360673,-1.360673 z"
        />
        <circle
          style={{
            fill: "#ff933c",
            fillOpacity: 1,
            stroke: "none",
            strokeWidth: 0.944324,
            strokeLinejoin: "round",
          }}
          cx="-40.00713"
          cy="26.737717"
          r="1.2466022"
        />
      </g>
    </g>
  </svg>
);
