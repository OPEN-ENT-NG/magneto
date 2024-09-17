export const menuStyle = {
  "& .MuiPaper-root": {
    width: "fit-content",
    paddingTop: "0",
    paddingBottom: "0",
    backgroundColor: "white",
    color: "black",
    border: "1px solid #e0e0e0",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    outline: "none !important",
    "& .MuiList-root": {
      paddingTop: 0,
      paddingBottom: 0,
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
  },
};

export const menuItemStyle = {
  paddingLeft: ".2rem",
  paddingRight: ".4rem",
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
};

export const listItemIconStyle = {
  color: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2rem",
  height: "2rem",
};

export const listItemTextStyle = {
  "& .MuiListItemText-primary, & .MuiListItemText-secondary": {
    color: "inherit",
    fontSize: "1.5rem",
  },
};
