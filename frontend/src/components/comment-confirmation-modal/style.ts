import { SxProps, Theme } from "@mui/material";

import { StyleProps } from "./types";

export const modalPaperStyles = ({ rect }: StyleProps): SxProps<Theme> => ({
  position: "absolute",
  top: `${rect.top + window.scrollY}px`,
  left: `${rect.left + window.scrollX}px`,
  width: `${rect.width}px`,
  height: `${rect.height}px`,
  borderRadius: 1,
  backgroundColor: "rgba(0, 0, 0, 0.75)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1rem",
  justifyContent: "center",
});

export const titleStyles: SxProps<Theme> = {
  color: "white",
  fontSize: "1.6rem",
  fontWeight: "600",
};

export const buttonContainerStyles: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 1,
};

export const cancelButtonStyles: SxProps<Theme> = {
  fontSize: "1.6rem",
  borderRadius: "1rem",
  backgroundColor: "white",
  color: "#FF8D2E",
  borderColor: "#FF8D2E",
  "&:hover": {
    borderColor: "#FF8D2E",
  },
};

export const deleteButtonStyles: SxProps<Theme> = {
  fontSize: "1.6rem",
  borderRadius: "1rem",
  backgroundColor: "#FF8D2E",
  color: "common.white",
  "&:hover": {
    backgroundColor: "error.dark",
  },
};
