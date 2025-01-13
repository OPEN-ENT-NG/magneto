import { Dispatch, ReactNode, RefObject, SetStateAction } from "react";

import {
  MediaLibraryRef,
  MediaLibraryResult,
  MediaLibraryType,
  TabsItemProps,
} from "@edifice.io/react";
import { WorkspaceElement } from "@edifice.io/client";

import { MediaProps } from "~/components/board-view/types";
import { MENU_NOT_MEDIA_TYPE } from "~/core/enums/menu-not-media-type.enum";
import { Board } from "~/models/board.model";

export interface MediaLibraryProviderProps {
  children: ReactNode;
}

export type MediaLibraryContextType = {
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
  workspaceElement: WorkspaceElement | null;
  setWorkspaceElement: Dispatch<SetStateAction<WorkspaceElement | null>>;
  setMedia: Dispatch<SetStateAction<MediaProps | null>>;
  handleClickMedia: (type: MediaLibraryType) => void;
  isCreateMagnetOpen: boolean;
  setIsCreateMagnetOpen: Dispatch<SetStateAction<boolean>>;
  magnetType: MENU_NOT_MEDIA_TYPE | null;
  setMagnetType: Dispatch<SetStateAction<MENU_NOT_MEDIA_TYPE | null>>;
  handleClickMenu: (type: MENU_NOT_MEDIA_TYPE) => void;
  onClose: () => void;
  selectedBoardData: Board | null;
  setSelectedBoardData: (id: Board | null) => void;
};
