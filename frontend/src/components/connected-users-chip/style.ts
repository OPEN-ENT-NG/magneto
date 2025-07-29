export const connectedUsersContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginRight: "20px",
  backgroundColor: "#F5F7F9",
  height: "50px",
  minWidth: "200px",
  maxWidth: "300px",
  borderRadius: "30px",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#E8EDEF",
  },
  "&:active, &.clicked": {
    backgroundColor: "#DCE2E6",
  },
  "& .MuiChip-label": {
    display: "flex",
    alignItems: "center",
    gap: 1,
    padding: "8px 0px 8px 12px",
    justifyContent: "flex-start",
    width: "100%",
  },
  "& .MuiChip-deleteIcon": {
    fontSize: "1.8rem",
    marginLeft: "auto",
    marginRight: "8px",
  },
};

export const expandMoreIconStyle = {
  fontSize: 40,
};

export const popoverStyle = {
  "& .MuiPopover-paper": {
    borderRadius: "12px",
    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
    border: "1px solid #E5E5E5",
    minWidth: "320px",
    maxWidth: "380px",
    mt: 1,
  },
};

export const popoverContainerStyle = {
  p: 2,
  paddingTop: "0.6rem",
};

export const listItemStyle = {
  px: 0,
  py: 1,
};

export const otherUserListItemStyle = {
  px: 0,
  paddingBottom: 1,
};

export const avatarListStyle = {
  width: 40,
  height: 40,
};

export const listItemAvatarStyle = {
  minWidth: "4.9rem",
};

export const roleTypographyStyle = {
  fontSize: "1.1rem",
};

export const usernameTypographyStyle = {
  fontWeight: 400,
  fontSize: "1.4rem",
};

export const dividerStyle = {
  mb: 1,
};

export const onlineUsersTypographyStyle = {
  mt: "1.5rem",
  fontWeight: 600,
  fontSize: "1.3rem",
};

export const userListStyle = {
  p: 0,
  maxHeight: "300px",
  overflow: "auto",
};

export const tooltipPopperModifiers = [
  {
    name: "offset",
    options: {
      offset: [0, -5],
    },
  },
];

export const userTooltipStyle = {
  fontSize: "12px",
  padding: "6px 10px",
};
