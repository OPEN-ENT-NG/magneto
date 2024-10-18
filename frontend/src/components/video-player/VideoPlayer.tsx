import { Edit } from "@edifice-ui/icons";
import { IconButton } from "@edifice-ui/react";
import { Box } from "@mui/material";

import { MEDIA_LIBRARY_TYPE } from "~/core/enums/media-library-type.enum";
import { useMediaLibrary } from "~/providers/MediaLibraryProvider";
import { videoContainerStyle, videoStyle } from "./style";
import {
  iconButtonStyle,
  imageInputActions,
} from "../file-picker-workspace/style";

export const VideoPlayer = () => {
  const { media, handleClickMedia } = useMediaLibrary();
  console.log(media?.url);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={videoContainerStyle}>
        <Box sx={videoStyle}>
          {media?.url.includes("workspace") ? (
            <video controls src={media?.url} width={450} height={225}></video>
          ) : (
            <iframe width={450} height={225} src={media?.url} />
          )}
          <Box sx={imageInputActions}>
            <IconButton
              aria-label={"addButtonLabel"}
              color="tertiary"
              icon={<Edit />}
              onClick={() => {
                handleClickMedia(MEDIA_LIBRARY_TYPE.VIDEO);
              }}
              type="button"
              variant="ghost"
              style={iconButtonStyle}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
