import { FC } from "react";

import { CustomSVGProps } from "./types";

export const SheetIcon: FC<CustomSVGProps> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 22.852 31.613"
    width="100%"
    height="100%"
  >
    <defs>
      <linearGradient
        id="b"
        gradientUnits="userSpaceOnUse"
        x1="61.467"
        y1="20.216"
        x2="66.718"
        y2="15.869"
      >
        <stop offset="0" stopColor="#137c55" />
        <stop offset="1" stopColor="#137c55" stopOpacity="0" />
      </linearGradient>
    </defs>
    <g transform="translate(-357.306 -90.919)">
      <g transform="translate(312.872 76.525)">
        <path
          d="M46.514 14.395h14.486l6.285 6.333v23.2c0 1.153-.928 2.08-2.08 2.08H46.514c-1.153 0-2.08-.927-2.08-2.08V16.475c0-1.152.927-2.08 2.08-2.08z"
          fill="#1bb47b"
        />
        <path
          d="m67.285 20.728-4.885.018c-.996.004-1.406-.707-1.406-1.663l.005-4.688z"
          fill="url(#b)"
          opacity=".762"
        />
        <g
          transform="matrix(.99816 0 0 .99816 .136 -.835)"
          stroke="#fffefb"
          strokeWidth="1.602"
          strokeMiterlimit="4"
          strokeDasharray="none"
        >
          <rect
            ry=".835"
            y="26.041"
            x="48.385"
            height="10.548"
            width="14.687"
            fill="#15895e"
            strokeWidth="2.369"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M51.287 25.515v11.339"
            fill="#fff"
            strokeWidth="1.001"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
          <path
            d="M48.145 29.353h15.12"
            fill="#fff"
            strokeWidth="1.001"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
          <path
            d="M47.98 33.366h15.119"
            fill="#fff"
            strokeWidth="1.001"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </g>
  </svg>
);
