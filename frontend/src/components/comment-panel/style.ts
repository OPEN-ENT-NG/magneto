import { IconButton, styled, SxProps } from "@mui/material";

export const commentPanelWrapper: SxProps = {
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  maxHeight: "80vh",
  width: "45rem",
  borderRadius: "1.5rem 1.5rem 0 0",
  position: "absolute",
  bottom: "0%",
  right: "5%",
  boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px;",
  zIndex: 1400,
  backgroundColor: "white",
};

export const commentPanelheader: SxProps = {
  width: "100%",
  boxShadow: "0px 4px 12px -4px rgba(0, 0, 0, 0.1)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "2rem",
};

export const leftHeaderContent: SxProps = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
};

export const commentPanelTitle: SxProps = {
  fontSize: "2.5rem",
  color: "#4A4A4A",
};

export const closeButtonStyle = {
  boxSizing: "border-box",
  fontSize: "2.5rem",
  borderRadius: "0.8rem",
  color: "#4a4a4a",
  opacity: 1,
};

export const transparentBackDrop = {
  backgroundColor: "transparent",
};

export const commentPanelBody: SxProps = {
  boxSizing: "border-box",
  padding: ".5rem 2rem",
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  flex: 1,
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: "0.8rem",
    height: "0.8rem",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(170,170,170,1)",
    borderRadius: "0.3rem",
  },
};

export const commentPanelFooter: SxProps = {
  boxSizing: "border-box",
  display: "flex",
  justifyContent: "space-between",
  backgroundColor: "#F7F7FA",
  padding: "1rem 2rem",
  width: "100%",
  height:"fit-content",
  minHeight: "6.5rem",
};

export const avatarStyle = {
  width: "3rem",
  height: "3rem",
  padding: 0,
};

export const leftFooterContent: SxProps = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  flex: 1,
  height:"fit-content",
};

export const footerInputStyle: SxProps = {
  fontSize: "1.6rem",
  flex: 1,
};

export const SubmitIconButton = styled(IconButton)<{ isEnabled: boolean }>(({
  isEnabled,
}) => {
  return {
    boxSizing: "border-box",
    fontSize: "2.5rem",
    borderRadius: "50%",
    color: isEnabled ? "#2A9AC7" : "#4a4a4a",
    opacity: 1,
    "&:hover": {
      borderRadius: "50%",
    },
  };
});

export const dividerTextStyle = {
  px: 1.5,
  py: 0.5,
  bgcolor: "grey.50",
  borderRadius: "2rem",
  color: "text.secondary",
  fontSize: "1.6rem",
};
