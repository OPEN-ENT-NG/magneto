import { FC } from "react";

import { CustomSVGProps } from "./types";

export const DefaultLinkIcon: FC<CustomSVGProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="100%"
    viewBox="0 0 22.851549 31.613312"
    {...props}
  >
    <defs>
      <linearGradient
        id="linearGradient973"
        x1="61.467"
        x2="68.514"
        y1="20.31"
        y2="13.696"
        gradientTransform="translate(-7.484 51.85)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#4819a7" />
        <stop offset="1" stopColor="#8b5de7" stopOpacity="0" />
      </linearGradient>
    </defs>
    <g transform="translate(-333.61 -46.162)">
      <g transform="translate(289.177 31.767)">
        <g transform="translate(7.498 -50.31)">
          <g transform="translate(.088 -1.471)">
            <path
              fill="#8b5de7"
              d="M39.03 66.245h14.486l6.286 6.333v23.2a2.08 2.08 0 01-2.08 2.08H39.031a2.08 2.08 0 01-2.08-2.08V68.326a2.08 2.08 0 012.08-2.08z"
            />
            <path
              fill="url(#linearGradient973)"
              d="M59.802 72.578l-4.885.018c-.997.004-1.406-.706-1.406-1.663l.005-4.688z"
              opacity="0.762"
            />
            <path
              fill="#fff"
              d="M47.593 82.524c.28.237.28.625 0 .862-.266.236-.703.236-.969 0-1.33-1.183-1.33-3.106 0-4.29l2.415-2.147c1.33-1.183 3.492-1.183 4.822 0 1.33 1.183 1.33 3.106 0 4.29l-1.016.903a3.783 3.783 0 00-.273-1.468l.32-.291c.805-.71.805-1.863 0-2.573-.798-.716-2.094-.716-2.892 0l-2.408 2.142c-.805.71-.805 1.863 0 2.572m1.923-2.572c.266-.237.703-.237.969 0 1.33 1.183 1.33 3.106 0 4.29l-2.415 2.147c-1.33 1.183-3.492 1.183-4.822 0-1.33-1.183-1.33-3.106 0-4.29l1.016-.903c-.008.497.082.995.273 1.474l-.32.285c-.805.71-.805 1.863 0 2.573.798.716 2.094.716 2.892 0l2.408-2.142c.805-.71.805-1.863 0-2.572-.28-.237-.28-.625 0-.862z"
            />
          </g>
        </g>
      </g>
    </g>
  </svg>
);
