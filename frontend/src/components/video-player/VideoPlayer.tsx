/* eslint-disable jsx-a11y/media-has-caption */
import { FC } from "react";

import { Edit } from "@edifice-ui/icons";
import { IconButton } from "@edifice-ui/react";
import { Box } from "@mui/material";

import { videoContainerStyle, videoStyle } from "./style";
import { VideoPlayerProps } from "./types";
import {
  iconButtonStyle,
  imageInputActions,
} from "../file-picker-workspace/style";
import { MEDIA_LIBRARY_TYPE } from "~/core/enums/media-library-type.enum";
import { useMediaLibrary } from "~/providers/MediaLibraryProvider";

export const VideoPlayer: FC<VideoPlayerProps> = ({ modifyFile }) => {
  const { media } = useMediaLibrary();

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={videoContainerStyle}>
        <Box sx={videoStyle}>
          {media?.url.includes("workspace") ? (
            <video controls src={media?.url} width={450} height={225}></video>
          ) : (
            <iframe
              title="embed-link"
              width={450}
              height={225}
              src={media?.url}
            />
          )}
          <Box sx={imageInputActions}>
            <IconButton
              aria-label={"addButtonLabel"}
              color="tertiary"
              icon={<Edit />}
              onClick={() => {
                modifyFile(MEDIA_LIBRARY_TYPE.VIDEO);
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
