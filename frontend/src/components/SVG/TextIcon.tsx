import { FC } from "react";

import { CustomSVGProps } from "./types";

export const TextIcon: FC<CustomSVGProps> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 22.852 31.613"
    width="100%"
    height="100%"
  >
    <defs>
      <linearGradient
        id="gradient"
        gradientUnits="userSpaceOnUse"
        x1="28.598"
        y1="20.609"
        x2="32.183"
        y2="17.502"
      >
        <stop offset="0" stopColor="#114bbb" />
        <stop offset="1" stopColor="#114bbb" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M2.08 0h14.486l6.285 6.333v23.2a2.08 2.08 0 01-2.08 2.08H2.08A2.08 2.08 0 010 29.533V2.08A2.08 2.08 0 012.08 0z"
      fill="#5388ef"
    />
    <path
      d="M22.851 6.333l-4.885.018c-.997.004-1.406-.707-1.406-1.663l.005-4.688z"
      fill="url(#gradient)"
      opacity=".762"
    />
    <g fill="#fff">
      <rect x="3.911" y="9.521" width="14.815" height="2.109" ry="1.055" />
      <rect x="3.999" y="14.948" width="14.815" height="2.109" ry="1.055" />
      <rect x="4.085" y="20.144" width="14.815" height="2.109" ry="1.055" />
    </g>
  </svg>
);
