import { MediaLibraryType } from "@edifice-ui/react";

import { EXTENSION_FORMAT } from "~/core/constants/extension-format.const";

export const getMediaLibraryType = (
  filename: string | undefined,
): MediaLibraryType => {
  if (!filename) return "attachment";
  const fileExtension = filename.split(".").pop()?.toLowerCase();

  if (!fileExtension) {
    return "attachment";
  }
  if (EXTENSION_FORMAT.VIDEO.includes(fileExtension)) {
    return "video";
  }
  if (EXTENSION_FORMAT.IMAGE.includes(fileExtension)) {
    return "image";
  }
  if (EXTENSION_FORMAT.AUDIO.includes(fileExtension)) {
    return "audio";
  }
  return "attachment";
};
