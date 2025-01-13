import { useState, useEffect, SetStateAction, Dispatch } from "react";

import { WorkspaceElement } from "@edifice.io/client";

import { useMediaLibrary } from "./useMediaLibrary";
import { MediaProps } from "~/components/board-view/types";
import { MEDIA_LIBRARY_TYPE } from "~/core/enums/media-library-type.enum";

export const useImageHandler = (
  defaultThumbnail: string,
  defaultBackground: string,
  pickerId: string,
  media: MediaProps | null,
  setMedia: Dispatch<SetStateAction<MediaProps | null>>,
) => {
  const [thumbnail, setThumbnail] = useState<MediaProps | null>(null);
  const [background, setBackground] = useState<MediaProps | null>(null);

  useEffect(() => {
    if (defaultThumbnail) {
      setThumbnail({
        type: MEDIA_LIBRARY_TYPE.IMAGE,
        id: defaultThumbnail.split("/").pop() || "",
        name: "",
        application: "",
        url: defaultThumbnail,
      });
    }
    if (defaultBackground) {
      setBackground({
        type: MEDIA_LIBRARY_TYPE.IMAGE,
        id: defaultBackground.split("/").pop() || "",
        name: "",
        application: "",
        url: defaultBackground,
      });
    }
  }, [defaultThumbnail, defaultBackground]);

  const {
    ref: mediaLibraryRef,
    libraryMedia,
    setLibraryMedia,
    ...mediaLibraryHandlers
  } = useMediaLibrary();

  useEffect(() => {
    if (libraryMedia) {
      const medialIb = libraryMedia as WorkspaceElement;
      setMedia({
        type: "image",
        id: medialIb?._id || "",
        name: medialIb?.name || "",
        application: "",
        url: medialIb?._id
          ? `/workspace/document/${medialIb?._id}`
          : (libraryMedia as string),
      });
    }
    setLibraryMedia(null);
  }, [libraryMedia]);

  useEffect(() => {
    if (media && pickerId) {
      if (pickerId === "thumbnail") {
        return setThumbnail(media);
      }
      if (pickerId === "background") {
        return setBackground(media);
      }
      setMedia(null);
    }
  }, [media, pickerId]);

  const handleUploadImage = () => {
    mediaLibraryRef.current?.show(MEDIA_LIBRARY_TYPE.IMAGE);
  };

  const handleDeleteThumbnail = () => {
    setThumbnail(null);
    setMedia(null);
  };
  const handleDeleteBackground = () => {
    setBackground(null);
    setMedia(null);
  };

  return {
    thumbnail,
    background,
    handleUploadImage,
    handleDeleteThumbnail,
    handleDeleteBackground,
    mediaLibraryRef,
    mediaLibraryHandlers,
    setBackground,
    setThumbnail,
    libraryMedia,
  };
};
