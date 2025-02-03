import { FC } from "react";

import { CustomSVGProps } from "./types";

export const DefaultVideoThumbnail: FC<CustomSVGProps> = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 140 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M118.171 72.66H10.1189C7.86535 72.6574 5.70489 71.761 4.11139 70.1675C2.51789 68.574 1.6215 66.4135 1.6189 64.16V10.3802C1.62141 8.12662 2.51775 5.96607 4.11127 4.37256C5.70478 2.77904 7.86533 1.88271 10.1189 1.88019H118.171C120.425 1.8827 122.585 2.77904 124.179 4.37256C125.772 5.96607 126.669 8.12662 126.671 10.3802V64.16C126.669 66.4135 125.772 68.574 124.179 70.1675C122.585 71.761 120.425 72.6574 118.171 72.66Z"
      fill="white"
    />
    <path
      d="M118.171 73.66H10.1189C7.60022 73.6572 5.18552 72.6554 3.40454 70.8744C1.62357 69.0934 0.621758 66.6787 0.618896 64.16V10.3802C0.621758 7.86157 1.62357 5.44687 3.40454 3.66589C5.18552 1.88492 7.60022 0.88311 10.1189 0.880249H118.171C120.69 0.88311 123.105 1.88492 124.885 3.66589C126.666 5.44687 127.668 7.86157 127.671 10.3802V64.16C127.668 66.6787 126.666 69.0934 124.885 70.8744C123.105 72.6554 120.69 73.6572 118.171 73.66ZM10.1189 2.88025C8.13044 2.88242 6.22405 3.67329 4.81799 5.07935C3.41194 6.4854 2.62107 8.39179 2.6189 10.3802V64.16C2.62107 66.1485 3.41194 68.0549 4.81799 69.4609C6.22405 70.867 8.13044 71.6579 10.1189 71.66H118.171C120.16 71.6579 122.066 70.867 123.472 69.4609C124.878 68.0549 125.669 66.1485 125.671 64.16V10.3802C125.669 8.39179 124.878 6.4854 123.472 5.07935C122.066 3.67329 120.16 2.88242 118.171 2.88025H10.1189Z"
      fill="#CCCCCC"
    />
    <path
      d="M100.419 99.1199H27.6309C25.4907 99.1176 23.4389 98.2657 21.9264 96.7515C20.4138 95.2372 19.5642 93.1845 19.5642 91.0443C19.5642 88.904 20.4138 86.8513 21.9264 85.337C23.4389 83.8228 25.4907 82.9709 27.6309 82.9686H100.419C102.561 82.9686 104.615 83.8194 106.13 85.3339C107.644 86.8483 108.495 88.9024 108.495 91.0443C108.495 93.1861 107.644 95.2402 106.13 96.7546C104.615 98.2691 102.561 99.1199 100.419 99.1199Z"
      fill="#E6E6E6"
    />
    <path
      d="M52.2632 58.0529C51.6498 58.0511 51.0468 57.8941 50.5105 57.5964C49.9367 57.287 49.4582 56.827 49.1263 56.266C48.7944 55.7049 48.6217 55.064 48.6268 54.4122V24.3984C48.6268 23.7476 48.8016 23.1087 49.1329 22.5486C49.4643 21.9885 49.9399 21.5276 50.5103 21.2142C51.0807 20.9008 51.7248 20.7464 52.3752 20.767C53.0257 20.7877 53.6587 20.9827 54.208 21.3316L82.6792 36.3386C83.1955 36.6666 83.6206 37.1196 83.9151 37.6557C84.2097 38.1918 84.3641 38.7936 84.3641 39.4053C84.3641 40.017 84.2097 40.6187 83.9151 41.1548C83.6206 41.6909 83.1955 42.144 82.6792 42.472L54.208 57.4789C53.6278 57.8518 52.953 58.051 52.2632 58.0529Z"
      fill="#EDBE2F"
    />
    <path
      d="M126.919 82.3055C133.752 82.3055 139.291 76.7662 139.291 69.9331C139.291 63.1001 133.752 57.5608 126.919 57.5608C120.086 57.5608 114.547 63.1001 114.547 69.9331C114.547 76.7662 120.086 82.3055 126.919 82.3055Z"
      fill="#3F3D56"
    />
    <path
      d="M125.993 74.8779C125.966 74.8779 125.94 74.877 125.913 74.8757C125.68 74.8645 125.453 74.8029 125.246 74.6954C125.038 74.5878 124.857 74.4368 124.714 74.2526L122.646 71.5943C122.516 71.4266 122.42 71.2347 122.363 71.0297C122.307 70.8247 122.291 70.6107 122.318 70.3997C122.344 70.1887 122.412 69.985 122.517 69.8002C122.622 69.6154 122.762 69.4531 122.93 69.3226L123.004 69.2647C123.172 69.134 123.364 69.0377 123.569 68.9813C123.774 68.9248 123.988 68.9094 124.199 68.9357C124.41 68.9621 124.614 69.0298 124.799 69.1349C124.984 69.2401 125.146 69.3807 125.277 69.5486C125.381 69.6827 125.513 69.7926 125.664 69.871C125.815 69.9493 125.981 69.9941 126.151 70.0024C126.32 70.0106 126.49 69.9821 126.648 69.9188C126.806 69.8555 126.948 69.759 127.065 69.6357L131.263 65.2036C131.558 64.8923 131.965 64.711 132.394 64.6993C132.823 64.6877 133.24 64.8467 133.552 65.1414L133.62 65.207C133.775 65.3532 133.899 65.5284 133.985 65.7225C134.072 65.9167 134.12 66.126 134.125 66.3385C134.131 66.551 134.095 66.7626 134.019 66.9611C133.943 67.1596 133.828 67.3412 133.682 67.4955L127.167 74.3722C127.016 74.532 126.834 74.6591 126.632 74.7461C126.43 74.833 126.212 74.8779 125.993 74.8779Z"
      fill="white"
    />
  </svg>
);
