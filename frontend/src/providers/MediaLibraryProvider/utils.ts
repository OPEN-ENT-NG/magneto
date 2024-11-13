import { MediaLibraryType } from "@edifice-ui/react";

import { EXTENSION_FORMAT } from "~/core/constants/extension-format.const";
import { MEDIA_LIBRARY_TYPE } from "~/core/enums/media-library-type.enum";

export const getMediaLibraryType = (
  filename: string | undefined,
): MediaLibraryType => {
  if (!filename) return MEDIA_LIBRARY_TYPE.ATTACHMENT;
  const fileExtension = filename.split(".").pop()?.toLowerCase();

  if (!fileExtension) {
    return MEDIA_LIBRARY_TYPE.ATTACHMENT;
  }
  if (EXTENSION_FORMAT.VIDEO.includes(fileExtension)) {
    return MEDIA_LIBRARY_TYPE.VIDEO;
  }
  if (EXTENSION_FORMAT.IMAGE.includes(fileExtension)) {
    return MEDIA_LIBRARY_TYPE.IMAGE;
  }
  if (EXTENSION_FORMAT.AUDIO.includes(fileExtension)) {
    return MEDIA_LIBRARY_TYPE.AUDIO;
  }
  return MEDIA_LIBRARY_TYPE.ATTACHMENT;
};
