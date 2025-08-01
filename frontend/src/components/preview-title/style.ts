import styled from "@emotion/styled";
import { Chip } from "@mui/material";

export const titleWrapper = {
  display: "flex",
  flexDirection: "column",
};

export const secondLineWrapper = {
  display: "flex",
  flexWrap: "nowrap",
  alignItems: "center",
  gap: "1rem",
};

export const titleStyle = {
  fontWeight: "bold",
  fontSize: "3rem",
  overflowX: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  color: "#5b6472",
};

export const createdByStyle = {
  fontStyle: "italic",
  fontSize: "1.5rem",
  overflowX: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  color: "#5b6472",
};

export const timeStyle = {
  fontStyle: "italic",
  fontSize: "1.5rem",
  overflowX: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  color: "#d6d6d6",
};

export const EditingChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "userColor",
})<{ userColor: string }>(({ userColor }) => ({
  backgroundColor: `${userColor} !important`,
  color: "#fff !important",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: "500",
  opacity: "1 !important",
  border: "none",
  boxShadow: "none",
  fontFamily: "Inter, Arial, sans-serif",
  "& .MuiChip-label": {
    padding: "4px 8px 4px 4px",
    color: "#fff !important",
    fontFamily: "inherit",
  },
  "& .MuiChip-icon": {
    color: "#fff !important",
    marginLeft: "4px",
    marginRight: "0px",
  },
  "&:hover": {
    backgroundColor: `${userColor} !important`,
  },
  "&:focus": {
    backgroundColor: `${userColor} !important`,
  },
}));

export const iconStyle = { color: "#fff !important", fontSize: "14px" };
