import { FC, useState } from "react";

import { useEdificeClient } from "@edifice.io/react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  AvatarGroup,
  Box,
  Typography,
  Chip,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  connectedUsersContainerStyle,
  listItemAvatarStyle,
  expandMoreIconStyle,
  popoverStyle,
  popoverContainerStyle,
  listItemStyle,
  otherUserListItemStyle,
  usernameTypographyStyle,
  dividerStyle,
  onlineUsersTypographyStyle,
  userListStyle,
  BorderedAvatar,
  currentUserBoxStyle,
  userInfoBoxStyle,
  otherUserRoleStyle,
  roleTypographyStyle,
} from "./style";
import { UserAvatar } from "../user-avatar/UserAvatar";
import { MUI_CONSTANTS } from "~/core/enums/MUI-constants.enum";
import { useWebSocketMagneto } from "~/providers/WebsocketProvider";

export const ConnectedUsersChip: FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const edificeClient = useEdificeClient();
  const { readyState, connectedUsers } = useWebSocketMagneto();
  const { t } = useTranslation("magneto");

  const handleChipClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const otherConnectedUsers = connectedUsers.filter(
    (user) => user.id !== edificeClient.user?.userId,
  );

  const currentUser = connectedUsers.find(
    (user) => user.id === edificeClient.user?.userId,
  );

  if (readyState !== WebSocket.OPEN) {
    return null;
  }

  return (
    <>
      <Chip
        sx={connectedUsersContainerStyle}
        label={
          <>
            {!!otherConnectedUsers.length && (
              <AvatarGroup
                max={4}
                componentsProps={{
                  additionalAvatar: {
                    sx: {
                      width: "4rem !important",
                      height: "4rem !important",
                      fontSize: "1.7rem !important",
                      border: "none !important",
                      boxShadow: "0 0 0 2px white !important",
                    },
                  },
                }}
                renderSurplus={(surplus) => (
                  <BorderedAvatar
                    borderColor="var(--theme-palette-grey-dark)"
                    size="medium"
                  >
                    +{surplus}
                  </BorderedAvatar>
                )}
              >
                {otherConnectedUsers.map((user) => (
                  <UserAvatar key={user.id} user={user} size="small" />
                ))}
              </AvatarGroup>
            )}
            <Box sx={currentUserBoxStyle}>
              {currentUser && (
                <UserAvatar
                  user={currentUser}
                  size="medium"
                  isCurrentUser={true}
                />
              )}
            </Box>
          </>
        }
        deleteIcon={<ExpandMoreIcon sx={expandMoreIconStyle} />}
        onClick={handleChipClick}
        onDelete={handleChipClick}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={popoverStyle}
      >
        <Box sx={popoverContainerStyle}>
          {/* Utilisateur actuel en premier */}
          {currentUser && (
            <ListItem sx={listItemStyle}>
              <ListItemAvatar sx={listItemAvatarStyle}>
                <UserAvatar user={currentUser} size="medium" />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    variant={MUI_CONSTANTS.BODY1}
                    sx={usernameTypographyStyle}
                  >
                    {currentUser?.username + t("magneto.(you)") ||
                      t("magneto.you")}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant={MUI_CONSTANTS.BODY2}
                    color={MUI_CONSTANTS.TEXT_SECONDARY}
                    sx={roleTypographyStyle}
                  >
                    {t(`magneto.user.${currentUser?.rights.maxRight}`)}
                  </Typography>
                }
              />
            </ListItem>
          )}
          <Divider sx={dividerStyle} />

          <Typography variant="h6" sx={onlineUsersTypographyStyle}>
            {t("magneto.users.online")} ({otherConnectedUsers.length})
          </Typography>
          <List sx={userListStyle}>
            {/* Autres utilisateurs connectés */}
            {otherConnectedUsers.map((user) => (
              <ListItem key={user.id} sx={otherUserListItemStyle}>
                <ListItemAvatar sx={listItemAvatarStyle}>
                  <UserAvatar user={user} size="medium" />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={userInfoBoxStyle}>
                      <Typography
                        variant={MUI_CONSTANTS.BODY1}
                        sx={usernameTypographyStyle}
                      >
                        {user.username || t("magneto.user")}
                      </Typography>
                      <Typography
                        variant={MUI_CONSTANTS.BODY2}
                        color={MUI_CONSTANTS.TEXT_SECONDARY}
                        sx={otherUserRoleStyle}
                      >
                        {t(`magneto.user.${user.rights.maxRight}`)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>
    </>
  );
};
