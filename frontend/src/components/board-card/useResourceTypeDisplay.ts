import { useMemo } from "react";

import {
  mdiFileMultiple,
  mdiFormatSize,
  mdiImage,
  mdiLink,
  mdiMusicNote,
  mdiPlayCircle,
} from "@mdi/js";
import TableChartIcon from "@mui/icons-material/TableChart";

import { RESOURCE_TYPE } from "~/core/enums/resource-type.enum";
import { getMuiIconPath } from "~/hooks/useMUIIconPath";

export const useResourceTypeDisplay = (resourceType: string) => {
  const tableChartPath = getMuiIconPath(TableChartIcon);

  return useMemo(() => {
    let icon: string = mdiFileMultiple;
    let type: string = "Fichier";

    switch (resourceType) {
      case RESOURCE_TYPE.VIDEO: {
        icon = mdiPlayCircle;
        type = "Vidéo";
        break;
      }
      case RESOURCE_TYPE.LINK: {
        icon = mdiLink;
        type = "Lien";
        break;
      }
      case RESOURCE_TYPE.TEXT: {
        icon = mdiFormatSize;
        type = "Texte";
        break;
      }
      case RESOURCE_TYPE.IMAGE: {
        icon = mdiImage;
        type = "Image";
        break;
      }
      case RESOURCE_TYPE.AUDIO: {
        icon = mdiMusicNote;
        type = "Audio";
        break;
      }
      case RESOURCE_TYPE.BOARD: {
        icon = tableChartPath;
        type = "Tableau";
        break;
      }
      case RESOURCE_TYPE.FILE: {
        icon = mdiFileMultiple;
        type = "Fichier";
        break;
      }
    }

    return {
      icon,
      type,
    };
  }, [resourceType]);
};
