import { FC, useState } from "react";

import { useEdificeClient } from "@edifice.io/react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Avatar,
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
  roleTypographyStyle,
} from "./style";
import {
  userTooltipStyle,
  expandMoreIconStyle,
  popoverStyle,
  popoverContainerStyle,
  listItemStyle,
  otherUserListItemStyle,
  avatarListStyle,
  usernameTypographyStyle,
  dividerStyle,
  onlineUsersTypographyStyle,
  userListStyle,
  tooltipPopperModifiers,
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
              <AvatarGroup max={4}>
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
                    <Avatar
                      alt={user.username}
                      src={getAvatarURL(user.id, "user")}
                    ></Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
            )}
            <Box sx={{ marginLeft: "auto" }}>
              {" "}
              {/* Pousse cet avatar à droite */}
              <Tooltip
                title={edificeClient?.user?.username || t("magneto.you")}
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
                <Avatar
                  alt={edificeClient?.user?.username}
                  src={getAvatarURL(edificeClient?.user?.userId || "", "user")}
                ></Avatar>
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
              <Avatar
                src={getAvatarURL(edificeClient?.user?.userId || "", "user")}
                alt={edificeClient?.user?.username}
                sx={avatarListStyle}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body1" sx={usernameTypographyStyle}>
                  {edificeClient?.user?.username + " (vous)" ||
                    t("magneto.you")}
                </Typography>
              }
              secondary={
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={roleTypographyStyle}
                >
                  Éditeur
                </Typography>
              }
            />
          </ListItem>
          <Divider sx={dividerStyle} />

          <Typography variant="h6" sx={onlineUsersTypographyStyle}>
            Utilisateurs en ligne ({otherConnectedUsers.length})
          </Typography>
          <List sx={userListStyle}>
            {/* Autres utilisateurs connectés */}
            {otherConnectedUsers.map((user) => (
              <ListItem key={user.id} sx={otherUserListItemStyle}>
                <ListItemAvatar sx={listItemAvatarStyle}>
                  <Avatar
                    src={getAvatarURL(user.id, "user")}
                    alt={user.username}
                    sx={avatarListStyle}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body1" sx={usernameTypographyStyle}>
                        {user.username || t("magneto.user")}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ marginRight: 1, fontSize: "1.1rem" }}
                      >
                        Éditeur
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
