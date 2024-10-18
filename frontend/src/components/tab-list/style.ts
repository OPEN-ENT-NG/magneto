import { Tab, styled } from "@mui/material";

export const StyledTab = styled(Tab)(() => ({
  textTransform: "none",
  fontSize: "1.3rem",
  color: "#368daf",
  "&.Mui-selected": {
    color: "#368daf",
  },
}));

export const tabsStyle = {
  "& .MuiTabs-indicator": {
    backgroundColor: "#368daf",
    height: "3px",
  },
};
