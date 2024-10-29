import { Tab, styled } from "@mui/material";

export const StyledTab = styled(Tab)(() => ({
  textTransform: "none",
  maxWidth: "500px",
  fontSize: "1.7rem",
  color: "#555555",
  "&.Mui-selected": {
    color: "#368daf",
  },
}));

export const tabsStyle = {
  justifyContent: "center",
  "& .MuiTabs-indicator": {
    backgroundColor: "#368daf",
    height: "3px",
  },
};
