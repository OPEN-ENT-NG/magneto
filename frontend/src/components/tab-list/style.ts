export const tabStyle = {
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
};

export const alternativeTabStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  maxHeight: "50px",
  paddingBottom: 0,
  fontSize: "1.6rem",
  lineHeight: 2.4,
  "& .MuiTab-iconWrapper": {
    display: "flex",
    alignItems: "center",
    marginRight: "8px",
    marginBottom: 0,
  },
  "& .MuiTab-label": {
    display: "flex",
    alignItems: "center",
  },
};

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

export const alternativeTabsStyle = {
  borderBottom: 1,
  borderColor: "divider",
  width: "100%",
  height: "65px",
  "& .MuiTabs-scroller": {
    overflow: "hidden",
  },
};
