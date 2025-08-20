import { FC, useState } from "react";

import { useEdificeClient } from "@edifice.io/react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  AvatarGroup,
  Box,
  Tooltip,
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
  userTooltipStyle,
  expandMoreIconStyle,
  popoverStyle,
  popoverContainerStyle,
  listItemStyle,
  otherUserListItemStyle,
  usernameTypographyStyle,
  dividerStyle,
  onlineUsersTypographyStyle,
  userListStyle,
  tooltipPopperModifiers,
  BorderedAvatar,
  currentUserBoxStyle,
  userInfoBoxStyle,
  otherUserRoleStyle,
  roleTypographyStyle,
} from "./style";
import useDirectory from "~/hooks/useDirectory";
import { useWebSocketMagneto } from "~/providers/WebsocketProvider";

export const ConnectedUsersChip: FC = () => {
  const { getAvatarURL } = useDirectory();
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

  const getInitials = (username?: string): string => {
    if (!username) return "??";

    const words = username.trim().split(/\s+/);

    if (words.length === 1) {
      // 1 mot : prendre les 2 premières lettres
      return words[0].slice(0, 2).toUpperCase();
    } else {
      // 2+ mots : première lettre du premier mot + première lettre du dernier mot
      const firstLetter = words[0].charAt(0);
      const lastLetter = words[words.length - 1].charAt(0);
      return (firstLetter + lastLetter).toUpperCase();
    }
  };

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
                  <Tooltip
                    key={user.id}
                    title={user.username || t("magneto.user")}
                    placement="bottom"
                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: userTooltipStyle,
                      },
                    }}
                    slotProps={{
                      popper: {
                        modifiers: tooltipPopperModifiers,
                      },
                    }}
                  >
                    <BorderedAvatar
                      alt={user.username}
                      src={getAvatarURL(user.id, "user")}
                      borderColor={user.color}
                      size="small"
                    >
                      {getInitials(user.username)}
                    </BorderedAvatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
            )}
            <Box sx={currentUserBoxStyle}>
              <Tooltip
                title={
                  currentUser?.username + t("magneto.(you)") || t("magneto.you")
                }
                placement="bottom"
                arrow
                componentsProps={{
                  tooltip: {
                    sx: userTooltipStyle,
                  },
                }}
                slotProps={{
                  popper: {
                    modifiers: tooltipPopperModifiers,
                  },
                }}
              >
                <BorderedAvatar
                  alt={currentUser?.username}
                  src={getAvatarURL(currentUser?.id || "", "user")}
                  borderColor={currentUser?.color || "#cccccc"}
                  size="medium"
                >
                  {getInitials(currentUser?.username)}
                </BorderedAvatar>
              </Tooltip>
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
          <ListItem sx={listItemStyle}>
            <ListItemAvatar sx={listItemAvatarStyle}>
              <BorderedAvatar
                src={getAvatarURL(currentUser?.id || "", "user")}
                alt={currentUser?.username}
                borderColor={currentUser?.color || "#cccccc"}
                size="medium"
              >
                {getInitials(currentUser?.username)}
              </BorderedAvatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body1" sx={usernameTypographyStyle}>
                  {currentUser?.username + " (vous)" || t("magneto.you")}
                </Typography>
              }
              secondary={
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={roleTypographyStyle}
                >
                  {t(`magneto.user.${currentUser?.rights.maxRight}`)}
                </Typography>
              }
            />
          </ListItem>
          <Divider sx={dividerStyle} />

          <Typography variant="h6" sx={onlineUsersTypographyStyle}>
            {t("magneto.users.online")} ({otherConnectedUsers.length})
          </Typography>
          <List sx={userListStyle}>
            {/* Autres utilisateurs connectés */}
            {otherConnectedUsers.map((user) => (
              <ListItem key={user.id} sx={otherUserListItemStyle}>
                <ListItemAvatar sx={listItemAvatarStyle}>
                  <BorderedAvatar
                    src={getAvatarURL(user.id, "user")}
                    alt={user.username}
                    borderColor={user.color}
                    size="medium"
                  >
                    {getInitials(user.username)}
                  </BorderedAvatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={userInfoBoxStyle}>
                      <Typography variant="body1" sx={usernameTypographyStyle}>
                        {user.username || t("magneto.user")}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
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
