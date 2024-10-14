import { MediaLibraryType } from "@edifice-ui/react";
import { MEDIA_LIBRARY_TYPE } from "~/core/enums/media-library-type.enum";
import { RESOURCE_TYPE } from "~/core/enums/resource-type.enum";

export const convertMediaTypeToResourceType = (
  mediaType: MediaLibraryType | undefined,
): string => {
  switch (mediaType) {
    case MEDIA_LIBRARY_TYPE.ATTACHMENT:
      return RESOURCE_TYPE.FILE;
    case MEDIA_LIBRARY_TYPE.IMAGE:
      return RESOURCE_TYPE.IMAGE;
    case MEDIA_LIBRARY_TYPE.AUDIO:
      return RESOURCE_TYPE.AUDIO;
    case MEDIA_LIBRARY_TYPE.VIDEO:
      return RESOURCE_TYPE.VIDEO;
    case MEDIA_LIBRARY_TYPE.HYPERLINK:
      return RESOURCE_TYPE.HYPERLINK;
    case MEDIA_LIBRARY_TYPE.EMBEDDER:
      return RESOURCE_TYPE.EMBEDDER;
    default:
      return "";
  }
};
