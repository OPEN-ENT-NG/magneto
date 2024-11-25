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
} from "@edifice-ui/react";
import { WorkspaceElement } from "edifice-ts-client";

import { MediaLibraryContextType, MediaLibraryProviderProps } from "./types";
import { getMediaLibraryType } from "./utils";
import { MediaProps } from "~/components/board-view/types";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { MENU_NOT_MEDIA_TYPE } from "~/core/enums/menu-not-media-type.enum";
import { useBoard } from "~/providers/BoardProvider";
import { useMediaLibrary as useMediaLibraryHook } from "~/hooks/useMediaLibrary";

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
    setWorkspaceElement(null);
  };

  const updateLibraryMedia = () => {
    setMedia(null);
    if (libraryMedia) {
      if (libraryMedia.url) {
        const medialIb = libraryMedia as IExternalLink;
        setMedia({
          type: (media as MediaProps).type,
          id: "",
          application: "",
          name: medialIb?.text || "",
          url: medialIb?.url,
          targetUrl: medialIb.target,
        });
      } else if (libraryMedia.resources) {
        const medialIb = libraryMedia as InternalLinkTabResult;
        setMedia({
          type: (media as MediaProps).type,
          id: medialIb?.resources?.[0]?.assetId ?? "",
          name: medialIb?.resources?.[0]?.name || "",
          application: medialIb?.resources?.[0]?.application || "",
          url:
            medialIb.resources?.[0]?.path ??
            `/${medialIb.resources?.[0]?.application}#/view/${medialIb.resources?.[0]?.assetId}`,
          targetUrl: medialIb.target,
        });
      } else {
        const medialIb = libraryMedia as WorkspaceElement;
        setMedia({
          type: (media as MediaProps)?.type ?? "",
          id: medialIb?._id || "",
          name: medialIb?.name || "",
          application: "",
          url: medialIb?._id
            ? `/workspace/document/${medialIb?._id}`
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
      handleClickMenu,
      onClose,
    }),
    [
      mediaLibraryRef,
      libraryMedia,
      media,
      isCreateMagnetOpen,
      magnetType,
      workspaceElement,
    ],
  );

  return (
    <MediaLibraryContext.Provider value={value}>
      {children}
    </MediaLibraryContext.Provider>
  );
};
