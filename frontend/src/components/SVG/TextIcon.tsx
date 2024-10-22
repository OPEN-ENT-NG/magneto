import { FC } from "react";

import { CustomSVGProps } from "./types";

export const TextIcon: FC<CustomSVGProps> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="100%"
    height="100%"
    viewBox="0 0 22.851549 31.61331"
  >
    <defs>
      <linearGradient
        id="gradient-text"
        gradientUnits="userSpaceOnUse"
        x1="28.597717"
        y1="20.608883"
        x2="32.182606"
        y2="17.501875"
      >
        <stop style={{ stopColor: "#114bbb", stopOpacity: 1 }} offset="0" />
        <stop style={{ stopColor: "#114bbb", stopOpacity: 0 }} offset="1" />
      </linearGradient>
    </defs>

    <g transform="translate(-139.00875,-92.294535)">
      <g transform="translate(127.43931,77.500223)">
        <path
          style={{
            fill: "#5388ef",
            fillOpacity: 1,
            stroke: "none",
            strokeWidth: 4.26188,
            strokeLinecap: "round",
            strokeLinejoin: "round",
          }}
          d="m 13.649965,14.794317 h 14.485507 l 6.285512,6.332759 v 23.200019 c 0,1.152612 -0.927915,2.080527 -2.080527,2.080527 H 13.649965 c -1.152612,0 -2.080527,-0.927915 -2.080527,-2.080527 V 16.874844 c 0,-1.152612 0.927915,-2.080527 2.080527,-2.080527 z"
        />
        <g transform="translate(0,-1.6036173)">
          <rect
            style={{
              fill: "#ffffff",
              stroke: "none",
              strokeWidth: 0.886382,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
            width="14.815158"
            height="2.1092067"
            x="15.481396"
            y="25.816023"
            ry="1.0546033"
          />
          <rect
            style={{
              fill: "#ffffff",
              stroke: "none",
              strokeWidth: 0.88638,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
            width="14.815158"
            height="2.1092067"
            x="15.569195"
            y="31.242617"
            ry="1.0546033"
          />
          <rect
            style={{
              fill: "#ffffff",
              stroke: "none",
              strokeWidth: 0.88638,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
            width="14.815158"
            height="2.1092067"
            x="15.654999"
            y="36.438961"
            ry="1.0546033"
          />
        </g>
        <path
          style={{
            opacity: 0.762238,
            fill: "url(#gradient-text)",
            stroke: "none",
            strokeWidth: 2.235,
            strokeLinecap: "round",
            strokeLinejoin: "round",
          }}
          d="m 34.420987,21.127077 -4.885447,0.01779 c -0.996393,0.0036 -1.405545,-0.706498 -1.405545,-1.662989 l 0.0054,-4.687566 z"
        />
      </g>
    </g>
  </svg>
);
