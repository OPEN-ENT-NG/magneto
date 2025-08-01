import { Avatar, styled } from "@mui/material";

export const connectedUsersContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  marginRight: "2rem",
  backgroundColor: "#F5F7F9",
  height: "5rem",
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
    gap: 2,
    padding: "0.8rem 0rem 0.8rem 1.2rem",
    justifyContent: "flex-start",
    width: "100%",
  },
  "& .MuiChip-deleteIcon": {
    fontSize: "1.8rem",
    marginLeft: "auto",
    marginRight: "0.8rem",
  },
  "& .MuiAvatarGroup-avatar": {
    "&:nth-of-type(1)": { zIndex: 4 },
    "&:nth-of-type(2)": { zIndex: 3 },
    "&:nth-of-type(3)": { zIndex: 2 },
    "&:nth-of-type(4)": { zIndex: 1 },
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
    pb: "0rem",
  },
};

export const popoverContainerStyle = {
  px: "1.6rem",
  py: "0.6rem",
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
  mb: "1rem",
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
  fontSize: "1.2rem",
  padding: "0.6rem 1rem",
};

export const BorderedAvatar = styled(Avatar)<{
  borderColor: string;
  size?: "small" | "medium";
}>`
  border: 2px solid ${({ borderColor }) => borderColor} !important;
  box-shadow: 0 0 0 2px white;
  background-color: ${({ borderColor }) => borderColor};
  width: ${({ size }) => (size === "small" ? "3.6rem" : "4.0rem")};
  height: ${({ size }) => (size === "small" ? "3.6rem" : "4.0rem")};
  font-size: 1.7rem;
`;

export const BorderedAvatarPlus = styled(Avatar)<{
  borderColor: string;
  size?: "small" | "medium";
}>`
  background-color: ${({ borderColor }) => borderColor};
  width: ${({ size }) => (size === "small" ? "3.6rem" : "4.0rem")} !important;
  height: ${({ size }) => (size === "small" ? "3.6rem" : "4.0rem")} !important;
  font-size: 1.7rem;
`;

export const currentUserBoxStyle = {
  marginLeft: "auto",
};

export const userInfoBoxStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const otherUserRoleStyle = {
  marginRight: 1,
  fontSize: "1.1rem",
};
