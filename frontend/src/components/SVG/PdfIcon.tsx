import { FC } from "react";

import { CustomSVGProps } from "./types";

export const PdfIcon: FC<CustomSVGProps> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 22.852 31.613"
    width="100%"
    height="100%"
  >
    <defs>
      <linearGradient
        id="a"
        gradientUnits="userSpaceOnUse"
        x1="61.467"
        y1="20.31"
        x2="65.962"
        y2="15.964"
      >
        <stop offset="0" stopColor="#af2b1b" />
        <stop offset="1" stopColor="#af2b1b" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M2.08 0h14.486l6.285 6.333v23.2a2.08 2.08 0 01-2.08 2.08H2.08A2.08 2.08 0 010 29.533V2.08A2.08 2.08 0 012.08 0z"
      fill="#e56353"
    />
    <path
      d="M22.851 6.333l-4.885.018c-.996.004-1.406-.706-1.406-1.663l.005-4.688z"
      fill="url(#a)"
      opacity=".762"
    />
    <path
      d="M3.865 22.763c.73.988 4.038-.73 6.185-6.228 2.148-5.498 2.534-7.689.945-7.946-1.589-.258-1.332 5.326 1.16 7.946 2.491 2.62 5.068 5.67 6.529 4.166 1.46-1.503-1.933-3.479-7.431-2.405-5.498 1.074-8.032 3.436-7.388 4.467z"
      fill="none"
      stroke="#fffefb"
      strokeWidth="1.437"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
