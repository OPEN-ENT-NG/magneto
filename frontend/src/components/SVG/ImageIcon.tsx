import { FC } from "react";

import { CustomSVGProps } from "./types";

export const ImageIcon: FC<CustomSVGProps> = () => (
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
        x2="33.695"
        y2="16.368"
      >
        <stop offset="0" stopColor="#d96000" />
        <stop offset="1" stopColor="#ff933c" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M2.08 0h14.486l6.285 6.333v23.2a2.08 2.08 0 01-2.08 2.08H2.08A2.08 2.08 0 010 29.533V2.08A2.08 2.08 0 012.08 0z"
      fill="#ff933c"
    />
    <path
      d="M22.851 6.333l-4.885.018c-.997.004-1.406-.707-1.406-1.663l.005-4.688z"
      fill="url(#gradient)"
      opacity=".762"
    />
    <path
      d="M8.724 16.033l1.701 2.041 2.381-3.062 3.062 4.082h-9.525m10.885.68v-9.524a1.361 1.361 0 00-1.36-1.361H7.363a1.361 1.361 0 00-1.36 1.36v9.525a1.361 1.361 0 001.36 1.36h9.525a1.361 1.361 0 001.36-1.36z"
      fill="#fff"
    />
    <circle cx="8.043" cy="12.018" r="1.247" fill="#ff933c" />
  </svg>
);
