import { Edit } from "@edifice-ui/icons";
import { IconButton } from "@edifice-ui/react";
import { Box, Typography } from "@mui/material";

import {
  svgContainerStyle,
  svgStyle,
  imageInputActions,
  iconButtonStyle,
  mediaNameStyle,
} from "./style";
import { CardContentSvgDisplay } from "../card-content-svg-display/CardContentSvgDisplay";
import { getFileExtension } from "~/components/file-picker-workspace/utils";
import { MEDIA_LIBRARY_TYPE } from "~/core/enums/media-library-type.enum";
import { useMediaLibrary } from "~/providers/MediaLibraryProvider";

export interface FilePickerWorkspaceProps {
  addButtonLabel: string;
}

export const FilePickerWorkspace = ({
  addButtonLabel = "Add image",
}: FilePickerWorkspaceProps) => {
  const { media, handleClickMedia } = useMediaLibrary();

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={svgContainerStyle}>
        <Box sx={svgStyle}>
          <CardContentSvgDisplay
            extension={getFileExtension(media?.name ?? "")}
          />
          <Box sx={imageInputActions}>
            <IconButton
              aria-label={addButtonLabel}
              color="tertiary"
              icon={<Edit />}
              onClick={() => {
                handleClickMedia(MEDIA_LIBRARY_TYPE.ATTACHMENT);
              }}
              type="button"
              variant="ghost"
              style={iconButtonStyle}
            />
          </Box>
        </Box>
        <Typography id="media-name" sx={mediaNameStyle}>
          {media?.name}
        </Typography>
      </Box>
    </Box>
  );
};
