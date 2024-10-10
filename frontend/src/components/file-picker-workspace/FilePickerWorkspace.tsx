import {
  ComponentPropsWithRef,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";

import { Delete, Edit } from "@edifice-ui/icons";
import { IWebApp } from "edifice-ts-client";

import clsx from "clsx";
import { IconButton } from "@edifice-ui/react";
import { Box, Typography } from "@mui/material";
import { CardContentSvgDisplay } from "../card-content-svg-display/CardContentSvgDisplay";
import { getFileExtension } from "~/hooks/useGetExtension";
import { useBoard } from "~/providers/BoardProvider";
import { useMediaLibrary } from "~/providers/MediaLibraryProvider";
import { MEDIA_LIBRARY_TYPE } from "~/core/enums/media-library-type.enum";

export interface FilePickerWorkspaceProps
  extends ComponentPropsWithRef<"input"> {
  addButtonLabel: string;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const svgContainerStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "18rem",
  marginBottom: "1rem",
};

const svgStyle = {
  height: "16rem",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
};

const mediaNameStyle = {
  textAlign: "center" as const,
  fontSize: "1.6rem",
  whiteSpace: "nowrap" as const,
  overflow: "hidden",
  textOverflow: "ellipsis",
  width: "80%",
};

const imageInputActions = {
  position: "absolute",
  top: "0",
  right: "-0.5rem",
  display: "flex",
  alignItems: "center",
  backgroundColor: "var(--edifice-white)",
  borderRadius: "0.8rem",
};

const iconButtonStyle = {
  "--edifice-btn-padding-x": "0.8rem",
  "--edifice-btn-padding-y": "0.8rem",
} as React.CSSProperties;

export const FilePickerWorkspace = ({
  addButtonLabel = "Add image",
  setIsOpen,
}: FilePickerWorkspaceProps) => {
  const { media, handleClickMedia } = useMediaLibrary();

  return (
    <div style={{ width: "100%" }}>
      {media && (
        <Box>
          <Box sx={svgContainerStyle}>
            <Box sx={svgStyle}>
              <CardContentSvgDisplay
                extension={getFileExtension(media?.name)}
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
      )}
    </div>
  );
};
