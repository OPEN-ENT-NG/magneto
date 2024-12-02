import { useState, useEffect } from "react";

import { MediaProps } from "~/components/board-view/types";
import { MEDIA_LIBRARY_TYPE } from "~/core/enums/media-library-type.enum";
import { useMediaLibrary } from "~/providers/MediaLibraryProvider";

export const useImageHandler = (
  defaultThumbnail: string,
  defaultBackground: string,
  pickerId: string,
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
    mediaLibraryRef,
    mediaLibraryHandlers,
    media,
    handleClickMedia,
    setMedia,
  } = useMediaLibrary();

  useEffect(() => {
    if (media && pickerId) {
      if (pickerId === "thumbnail") {
        return setThumbnail(media);
      }
      if (pickerId === "background") {
        return setBackground(media);
      }
    }
  }, [media, pickerId]);

  const handleUploadImage = () => {
    handleClickMedia(MEDIA_LIBRARY_TYPE.IMAGE);
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
  };
};
