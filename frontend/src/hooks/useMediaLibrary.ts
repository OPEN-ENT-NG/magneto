import { useRef, useState } from "react";

import { WorkspaceElement } from "@edifice.io/client";
import { TabsItemProps, useWorkspaceFile } from "@edifice.io/react";
import {
  MediaLibraryRef,
  MediaLibraryResult,
} from "@edifice.io/react/multimedia";

export const useMediaLibrary = () => {
  const mediaLibraryRef = useRef<MediaLibraryRef>(null);
  const [libraryMedia, setLibraryMedia] = useState<MediaLibraryResult>();
  const { remove } = useWorkspaceFile();

  const onCancel = async (uploads?: WorkspaceElement[]) => {
    if (mediaLibraryRef.current?.type && uploads && uploads.length > 0) {
      await remove(uploads);
    }
    mediaLibraryRef.current?.hide();
  };

  const onSuccess = (result: MediaLibraryResult) => {
    let updatedMedia;
    console.log("PASSE ICI", mediaLibraryRef.current?.type);
    switch (mediaLibraryRef.current?.type) {
      case "video": {
        if (typeof result === "object") {
          updatedMedia = result[0];
        } else {
          console.log("passe1");
          const parser = new DOMParser();
          const doc = parser.parseFromString(result, "text/html");
          const element = doc.body.firstChild as HTMLBodyElement;
          console.log("passe2");

          const href = element?.getAttribute("src");
          console.log(href);

          mediaLibraryRef.current?.hide();
          updatedMedia = href;
        }
        break;
      }
      case "embedder": {
        const parser = new DOMParser();
        const doc = parser.parseFromString(result, "text/html");
        const elementWithSrc = doc.querySelector("[src]");

        const href = elementWithSrc?.getAttribute("src");
        mediaLibraryRef.current?.hide();
        console.log("PASSE EMBEDER", href);

        updatedMedia = href;
        break;
      }
      case "audio": {
        if (result.length === undefined) {
          updatedMedia = result;
        } else {
          updatedMedia = result[0];
        }
        break;
      }
      case "hyperlink": {
        updatedMedia = result;
        break;
      }
      default: {
        updatedMedia = result[0];
      }
    }

    mediaLibraryRef.current?.hide();
    setLibraryMedia(updatedMedia);
    console.log("UPDATED MEDIA", updatedMedia);
  };

  const onTabChange = async (
    _tab: TabsItemProps,
    uploads?: WorkspaceElement[],
  ) => {
    if (mediaLibraryRef.current?.type && uploads && uploads.length > 0) {
      await remove(uploads);
    }
  };

  return {
    ref: mediaLibraryRef,
    libraryMedia,
    setLibraryMedia,
    onCancel,
    onSuccess,
    onTabChange,
  };
};
