import { FC } from "react";

import { CustomSVGProps } from "./types";

export const DefaultIcon: FC<CustomSVGProps> = () => (
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
        x1="119.129"
        y1="21.435"
        x2="123.247"
        y2="17.844"
      >
        <stop offset="0" stopColor="#cd7713" />
        <stop offset="1" stopColor="#ec9530" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M1.983 0.168h14.486l6.285 6.333v23.2a2.08 2.08 0 01-2.08 2.08H1.983a2.08 2.08 0 01-2.08-2.08V2.249a2.08 2.08 0 012.08-2.08z"
      fill="#ec9530"
    />
    <path
      d="M22.754 6.501l-4.885.018c-.997.004-1.406-.707-1.406-1.663l.005-4.688z"
      fill="url(#gradient)"
      opacity=".762"
    />
    <path
      d="M7.198 8.156a1.38 1.38 0 00-1.38 1.38v11.037a1.38 1.38 0 001.38 1.38h8.278a1.38 1.38 0 001.38-1.38v-8.278l-4.14-4.139H7.198m4.829 1.035l3.794 3.794h-3.794V9.191"
      fill="#fff"
    />
  </svg>
);
