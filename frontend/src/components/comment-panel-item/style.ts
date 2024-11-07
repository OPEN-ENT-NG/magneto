import { Box, styled, SxProps, TextField } from "@mui/material";

import { CommentInputProps, IsLastProps } from "./types";

export const CommentPanelItemWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isLast",
})<IsLastProps>(({ isLast }) => ({
  display: "flex",
  gap: "1rem",
  width: "100%",
  marginBottom: isLast ? "1rem" : "0",
}));

export const rightContentWrapper: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: ".5rem",
  flex: 1,
};

export const nameContentWrapper: SxProps = {
  display: "flex",
  gap: "1rem",
  alignItems: "center",
};

export const firstLineWrapper: SxProps = {
  display: "flex",
  justifyContent: "space-between",
  width: "100%",
};

export const nameStyle: SxProps = {
  color: "#4A4A4A",
  fontSize: "1.4rem",
};

export const dateStyle: SxProps = {
  color: "#A5A5A5",
  fontSize: "1.4rem",
};

export const greyDot: SxProps = {
  minWidth: ".5rem",
  minHeight: ".5rem",
  maxWidth: ".5rem",
  maxHeight: ".5rem",
  backgroundColor: "#A5A5A5",
  borderRadius: "50%",
};

export const StyledCommentInput = styled(TextField, {
  shouldForwardProp: (prop) => prop !== "isEditing",
})<CommentInputProps>(({ isEditing }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "1rem",
    padding: "1.5rem",
    fontSize: "1.6rem",
    border: "none",
    color: "#4A4A4A",
    transition: "all 0.2s ease-in-out",
    pointerEvents: isEditing ? "auto" : "none",

    "& .MuiOutlinedInput-notchedOutline": {
      border: `1px solid ${isEditing ? "#2A9AC7" : "#E4E4E4"}`,
    },

    "& fieldset": {
      border: `1px solid ${isEditing ? "#2A9AC7" : "#E4E4E4"}`,
    },

    "&:hover fieldset": {
      border: `1px solid ${isEditing ? "#2A9AC7" : "#E4E4E4"}`,
    },

    "&.Mui-focused fieldset": {
      border: `1px solid ${isEditing ? "#2A9AC7" : "#E4E4E4"}`,
    },
  },

  "& .MuiOutlinedInput-input": {
    padding: "0",
    paddingRight: isEditing ? "3rem" : "0",
    "&.Mui-disabled": {
      "-webkit-text-fill-color": "#4A4A4A !important",
    },
    "&::placeholder": {
      color: "#999",
      opacity: 1,
    },
    "&::-webkit-scrollbar": {
      width: "0.8rem",
      height: "0.8rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(170,170,170,1)",
      borderRadius: "0.3rem",
    },
  },

  width: "100%",
}));

export const updateIcon = {
  position: "absolute",
  right: "1.5rem",
  top: "50%",
  transform: "translateY(-50%)",
  boxSizing: "border-box",
  fontSize: "2.5rem",
  borderRadius: "50%",
  color: "#2A9AC7",
  opacity: 1,
  "&:hover": {
    borderRadius: "50%",
  },
};

export const relativeWrapper = { position: "relative", width: "100%" };
