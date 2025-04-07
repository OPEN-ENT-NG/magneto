import { Tab, styled } from "@mui/material";

export const StyledTab = styled(Tab)(() => ({
  textTransform: "none",
  maxWidth: "500px",
  fontSize: "clamp(1.3rem, 1.7vw, 1.7rem)",
  padding: "0.5rem min(1rem, 2%)",
  minWidth: "auto",
  color: "#555555",
  "&.Mui-selected": {
    color: "#368daf",
  },
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  margin: "0 0.3rem",
}));

export const tabsStyle = {
  width: "100%",
  overflowX: "auto",
  scrollbarWidth: "thin", // Firefox
  flexWrap: "nowrap",
  "&::-webkit-scrollbar": {
    height: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(54, 141, 175, 0.3)",
    borderRadius: "2px",
  },
  "& .MuiTabs-indicator": {
    backgroundColor: "#368daf",
    height: "3px",
  },
  "& .MuiTabs-flexContainer": {
    gap: "0.2rem",
  },
};
