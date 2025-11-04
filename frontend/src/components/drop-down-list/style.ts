export const menuStyle = {
  "& .MuiPaper-root": {
    width: "fit-content",
    paddingTop: "0",
    paddingBottom: "0",
    backgroundColor: "white",
    color: "black",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
    outline: "none !important",
    "& .MuiList-root": {
      paddingTop: 0,
      paddingBottom: 0,
    },
    "&:focus": {
      outline: "none !important",
      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
    },
    "&::before, &::after": {
      display: "none !important",
    },
    transition: "none !important",
  },
};

export const menuItemStyle = {
  paddingLeft: ".2rem",
  paddingRight: "1.4rem",
  "&:hover": {
    backgroundColor: "#ff8500",
    color: "white",
    "& .MuiListItemIcon-root, & .MuiListItemText-primary, & .MuiListItemText-secondary":
      {
        color: "white",
      },
    "& svg": {
      fill: "white",
    },
  },
  "&.Mui-disabled": {
    opacity: 0.6,
  },
};

export const listItemIconStyle = {
  color: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2rem",
  height: "2rem",
};

export const listItemTextStyle = (isTheme1D: boolean) => ({
  "& .MuiListItemText-primary, & .MuiListItemText-secondary": {
    color: "inherit",
    fontSize: "1.5rem",
    ...(isTheme1D && { fontFamily: "Arimo" }),
  },
});
