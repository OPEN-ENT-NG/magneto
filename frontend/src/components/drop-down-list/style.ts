import { ListItemText, Paper, styled } from "@mui/material";

export const DropdownListWrapper = styled(Paper)({
  position: "absolute",
  width: "fit-content",
  top: "100%",
  right: "1%",
  zIndex: 10,
  overflowY: "auto",
  marginTop: ".5rem",
  backgroundColor: "white",
  color: "black",
  border: "1px solid #e0e0e0",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  "& .MuiListItem-root": {
    "&:hover": {
      backgroundColor: "#ff8500",
      color: "white",
      "& .MuiListItemText-primary, & .MuiListItemText-secondary": {
        color: "white",
      },
      "& svg": {
        fill: "white",
      },
    },
  },
  "& .MuiListItemText-primary, & .MuiListItemText-secondary": {
    color: "black",
    fontSize: "1.5rem",
  },
  outline: "none !important",
  "&.MuiPaper-root": {
    outline: "none !important",
    border: "none !important",
  },
  "&:focus": {
    outline: "none !important",
    border: "none !important",
    boxShadow: "none !important",
  },
  "&::before, &::after": {
    display: "none !important",
  },
  transition: "none !important",
});

export const StyledListItemText = styled(ListItemText)({
  paddingTop: "0",
  paddingBottom: "0",
  paddingLeft: "1rem",
  paddingRight: "1rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  "& .MuiListItemText-primary": {
    marginRight: "0.5rem",
  },
});

export const SVGWrapperStyle = {
  height: "2rem",
};

export const listStyle = { paddingTop: "0", paddingBottom: "0" };
