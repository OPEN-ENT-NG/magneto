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
      return RESOURCE_TYPE.LINK;
    case MEDIA_LIBRARY_TYPE.EMBEDDER:
      return RESOURCE_TYPE.EMBEDDER;
    default:
      return "";
  }
};

export const convertResourceTypeToMediaType = (
  resourceType: string,
):  MediaLibraryType => {
  switch (resourceType) {
    case RESOURCE_TYPE.FILE:
      return MEDIA_LIBRARY_TYPE.ATTACHMENT;
    case RESOURCE_TYPE.PDF:
      return MEDIA_LIBRARY_TYPE.ATTACHMENT;
    case RESOURCE_TYPE.SHEET:
      return MEDIA_LIBRARY_TYPE.ATTACHMENT;
    case RESOURCE_TYPE.IMAGE:
      return MEDIA_LIBRARY_TYPE.IMAGE;
    case RESOURCE_TYPE.AUDIO:
      return MEDIA_LIBRARY_TYPE.AUDIO;
    case RESOURCE_TYPE.VIDEO:
      return MEDIA_LIBRARY_TYPE.VIDEO;
    case RESOURCE_TYPE.HYPERLINK:
      return MEDIA_LIBRARY_TYPE.HYPERLINK;
    case RESOURCE_TYPE.LINK:
      return MEDIA_LIBRARY_TYPE.HYPERLINK;
    case RESOURCE_TYPE.EMBEDDER:
      return MEDIA_LIBRARY_TYPE.EMBEDDER;
    case RESOURCE_TYPE.DEFAULT:
      return "" as MediaLibraryType;
    default:
      return "" as MediaLibraryType;
  }  
};
