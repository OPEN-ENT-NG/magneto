import { FC } from "react";

import { CustomSVGProps } from "./types";

export const VideoIcon: FC<CustomSVGProps> = () => (
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
        <stop offset="0" stopColor="#b48d12" />
        <stop offset="1" stopColor="#b48d12" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M2.08 0h14.486l6.285 6.333v23.2a2.08 2.08 0 01-2.08 2.08H2.08A2.08 2.08 0 010 29.533V2.08A2.08 2.08 0 012.08 0z"
      fill="#ecbe30"
    />
    <path
      d="M22.851 6.333l-4.885.018c-.997.004-1.406-.707-1.406-1.663l.005-4.688z"
      fill="url(#gradient)"
      opacity=".762"
    />
    <path
      d="M10.772 17.04l-5.825 4.543 5.825 4.543z"
      fill="#fff"
      stroke="#fffefb"
      strokeWidth="1.292"
      strokeLinejoin="round"
      transform="rotate(-52.017 10.772 21.583)"
    />
  </svg>
);
