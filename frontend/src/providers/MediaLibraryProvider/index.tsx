import {
  FC,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  IExternalLink,
  InternalLinkTabResult,
  MediaLibraryType,
} from "@edifice.io/react";
import { WorkspaceElement } from "@edifice.io/client";

import { MediaLibraryContextType, MediaLibraryProviderProps } from "./types";
import { getMediaLibraryType } from "./utils";
import { MediaProps } from "~/components/board-view/types";
import { MENU_NOT_MEDIA_TYPE } from "~/core/enums/menu-not-media-type.enum";
import { useMediaLibrary as useMediaLibraryHook } from "~/hooks/useMediaLibrary";
import { Board } from "~/models/board.model";

const MediaLibraryContext = createContext<MediaLibraryContextType | null>(null);

export const useMediaLibrary = () => {
  const context = useContext(MediaLibraryContext);
  if (!context) {
    throw new Error(
      "useMediaLibrary must be used within a MediaLibraryProvider",
    );
  }
  return context;
};

export const MediaLibraryProvider: FC<MediaLibraryProviderProps> = ({
  children,
}) => {
  const {
    ref: mediaLibraryRef,
    libraryMedia,
    setLibraryMedia,
    onCancel,
    onSuccess,
    onTabChange,
  } = useMediaLibraryHook();
  const [workspaceElement, setWorkspaceElement] =
    useState<WorkspaceElement | null>(null);
  const [media, setMedia] = useState<MediaProps | null>(null);
  const [isCreateMagnetOpen, setIsCreateMagnetOpen] = useState(false);
  const [magnetType, setMagnetType] = useState<MENU_NOT_MEDIA_TYPE | null>(
    null,
  );
  const [selectedBoardData, setSelectedBoardData] = useState<Board | null>(
    null,
  );

  const handleClickMedia = (type: MediaLibraryType) => {
    setMagnetType(null);
    setMedia({ ...(media as MediaProps), type });
    mediaLibraryRef.current?.show(type);
  };

  const handleClickMenu = (type: MENU_NOT_MEDIA_TYPE) => {
    setMedia(null);
    setMagnetType(type);
    if (type === MENU_NOT_MEDIA_TYPE.TEXT) {
      setIsCreateMagnetOpen(true);
    }
  };

  const onClose = () => {
    setMedia(null);
    setMagnetType(null);
    setIsCreateMagnetOpen(false);
    setLibraryMedia(null);
    setWorkspaceElement(null);
  };

  const updateLibraryMedia = () => {
    setMedia(null);
    if (libraryMedia) {
      if (libraryMedia.url) {
        const mediaLib = libraryMedia as IExternalLink;
        setMedia({
          type: (media as MediaProps).type,
          id: "",
          application: "",
          name: mediaLib?.text || "",
          url: mediaLib?.url,
          targetUrl: mediaLib.target,
        });
      } else if (libraryMedia.resources) {
        const mediaLib = libraryMedia as InternalLinkTabResult;
        setMedia({
          type: (media as MediaProps).type,
          id: mediaLib?.resources?.[0]?.assetId ?? "",
          name: mediaLib?.resources?.[0]?.name || "",
          application: mediaLib?.resources?.[0]?.application || "",
          url:
            mediaLib.resources?.[0]?.path ??
            `/${mediaLib.resources?.[0]?.application}#/view/${mediaLib.resources?.[0]?.assetId}`,
          targetUrl: mediaLib.target,
        });
      } else {
        const mediaLib = libraryMedia as WorkspaceElement;
        setMedia({
          type: (media as MediaProps)?.type ?? "",
          id: mediaLib?._id || "",
          name: mediaLib?.name || "",
          application: "",
          url: mediaLib?._id
            ? `/workspace/document/${mediaLib?._id}`
            : (libraryMedia as string),
        });
      }
      return setIsCreateMagnetOpen(true);
    }
    if (workspaceElement) {
      setMedia({
        type: getMediaLibraryType(workspaceElement?.name),
        id: workspaceElement?._id || "",
        name: workspaceElement?.name || "",
        application: "",
        url: workspaceElement?._id
          ? `/workspace/document/${workspaceElement?._id}`
          : (libraryMedia as string),
      });
      return setIsCreateMagnetOpen(true);
    }
  };

  useEffect(() => {
    updateLibraryMedia();
  }, [libraryMedia, workspaceElement]);

  const value = useMemo<MediaLibraryContextType>(
    () => ({
      workspaceElement,
      setWorkspaceElement,
      mediaLibraryRef,
      libraryMedia,
      mediaLibraryHandlers: {
        setLibraryMedia,
        onCancel,
        onSuccess,
        onTabChange,
      },
      media,
      setMedia,
      handleClickMedia,
      isCreateMagnetOpen,
      setIsCreateMagnetOpen,
      magnetType,
      setMagnetType,
      handleClickMenu,
      onClose,
      selectedBoardData,
      setSelectedBoardData,
    }),
    [
      mediaLibraryRef,
      libraryMedia,
      media,
      isCreateMagnetOpen,
      magnetType,
      workspaceElement,
      selectedBoardData,
    ],
  );

  return (
    <MediaLibraryContext.Provider value={value}>
      {children}
    </MediaLibraryContext.Provider>
  );
};
