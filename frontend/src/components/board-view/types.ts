import { MediaLibraryType } from "@edifice.io/react";

import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";

export interface MediaProps {
  id: string;
  name: string;
  application: string;
  type: MediaLibraryType;
  url: string;
  targetUrl?: string;
}

export interface IsModalOpenState {
  magnet: boolean;
}

export interface BoardBodyWrapperProps {
  layout: LAYOUT_TYPE;
  headerHeight: number;
}

export interface BoardViewWrapperProps {
  layout: LAYOUT_TYPE;
}
