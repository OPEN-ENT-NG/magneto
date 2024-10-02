import { Dispatch, ReactNode, RefObject, SetStateAction } from "react";

import {
  MediaLibraryRef,
  MediaLibraryResult,
  MediaLibraryType,
  TabsItemProps,
} from "@edifice-ui/react";
import { RightRole, WorkspaceElement } from "edifice-ts-client";

import { MediaProps } from "~/components/create-magnet/type";
import { Board } from "~/models/board.model";
import { Card } from "~/models/card.model";

export interface BoardProviderProps {
  children: ReactNode;
}

export type BoardContextType = {
  board: Board;
  zoomLevel: number;
  setZoomLevel: Dispatch<SetStateAction<number>>;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  isLoading: boolean;
  boardRights: Record<RightRole, boolean> | null;
  hasEditRights: () => boolean;
  mediaLibraryRef: RefObject<MediaLibraryRef>;
  libraryMedia: any;
  mediaLibraryHandlers: {
    setLibraryMedia: Dispatch<any>;
    onCancel: (uploads?: WorkspaceElement[]) => Promise<void>;
    onSuccess: (result: MediaLibraryResult) => void;
    onTabChange: (
      _tab: TabsItemProps,
      uploads?: WorkspaceElement[],
    ) => Promise<void>;
  };
  media: MediaProps | null;
  setMedia: Dispatch<SetStateAction<MediaProps | null>>;
  handleClickMedia: (type: MediaLibraryType) => void;
};

export type Section = {
  _id: string;
  title: string;
  cardIds: string[];
  boardId: string;
  page: number;
  cards: Card[];
  displayed?: boolean;
};

export type Sections = {
  all: Section[];
};
