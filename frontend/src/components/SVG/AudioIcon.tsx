import { FC } from "react";

import { CustomSVGProps } from "./types";

export const AudioIcon: FC<CustomSVGProps> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 22.852 31.881"
    width="100%"
    height="100%"
  >
    <defs>
      <linearGradient
        id="a"
        gradientUnits="userSpaceOnUse"
        x1="17.5"
        y1="5"
        x2="22.852"
        y2="0"
      >
        <stop offset="0" stopColor="#731c48" />
        <stop offset="1" stopColor="#b48d12" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M2.08 0h14.486l6.286 6.333v23.2a2.08 2.08 0 01-2.08 2.08H2.08A2.08 2.08 0 010 29.533V2.08A2.08 2.08 0 012.08 0z"
      fill="#ac2a6c"
    />
    <path
      d="M22.852 6.333l-4.885.018c-.997.004-1.406-.706-1.406-1.663L16.566 0z"
      fill="url(#a)"
      opacity=".762"
    />
    <path
      d="M7.082 18.242h1.315l1.644 1.645c1.811 1.955 1.644 1.716 1.644-.987v-2.63-2.631c-.063-2.95.104-2.734-1.644-.986l-1.644 1.644-1.311-.004c-1.205-.049-1.313.032-1.313.984l-.002.989-.002.988c0 .978.222.989 1.313.989zm5.919 0c0-.75-.006-3.113 0-3.946.006-.832 1.315-.845 1.315 0v3.91c0 .789-1.315.787-1.315.036zm3.946 2.63c0 .792-1.315.78-1.315 0v-9.206c0-.934 1.315-.935 1.315 0z"
      fill="#fff"
    />
  </svg>
);
