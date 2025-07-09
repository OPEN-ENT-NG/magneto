import { FC, useState } from "react";

import "./HeaderView.scss";

import { IWebApp } from "@edifice.io/client";
import {
  AppHeader,
  Breadcrumb,
  Button,
  useEdificeClient,
} from "@edifice.io/react";
import { mdiEarth } from "@mdi/js";
import Icon from "@mdi/react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
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
import { useNavigate } from "react-router-dom";

import {
  breadcrumbTitle,
  connectedUsersContainerStyle,
  externalToastStyle,
  externalToastTextStyle,
  isLockedToastStyle,
  leftWrapperStyle,
  mainWrapperStyle,
  rightWrapperStyle,
  userTooltipStyle,
  wrapperBoxStyle,
} from "./style";
import { BoardDescription } from "../board-description/BoardDescription";
import useDirectory from "~/hooks/useDirectory";
import { useBoard } from "~/providers/BoardProvider";
import { Section } from "~/providers/BoardProvider/types";
/*import {
  useConnectedUsers,
  useWebSocketManager,
} from "~/services/websocket/useWebSocketManager";*/

export const HeaderView: FC = () => {
  const { board, isExternalView } = useBoard();
  const { getAvatarURL } = useDirectory();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const magnetoWebApp: IWebApp = {
    address: "/magneto",
    displayName: "magneto",
    icon: `${window.location.host}/magneto/public/img/uni-magneto.png`,
    display: true,
    isExternal: true,
    name: "Magneto",
    prefix: "/magneto",
    scope: [""],
  };

  const edificeClient = useEdificeClient();
  //const { isConnected } = useWebSocketManager();
  const isConnected = false;
  const connectedUsers: any[] = []; //useConnectedUsers();
  const { currentApp } = isExternalView
    ? { currentApp: magnetoWebApp }
    : edificeClient;
  const { t } = useTranslation("magneto");
  const onClick = () =>
    navigate(
      isExternalView ? `/pub/${board.id}/read` : `/board/${board.id}/read`,
    );

  const handleChipClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const boardHasCards = (): boolean => {
    return (
      !!board.cardIds?.length ||
      !!(board.sections ?? []).find(
        (section: Section) => !!section.cardIds.length,
      )
    );
  };

  const otherConnectedUsers = connectedUsers?.filter(
    (user) => user.userId !== edificeClient?.user?.userId,
  );

  return (
    <AppHeader className="header-view">
      <Box sx={mainWrapperStyle}>
        <Box sx={wrapperBoxStyle}>
          <Box sx={leftWrapperStyle}>
            {isExternalView ? (
              <Typography sx={breadcrumbTitle}>{board.title}</Typography>
            ) : (
              currentApp && <Breadcrumb app={currentApp} name={board?.title} />
            )}
          </Box>
          <Box sx={rightWrapperStyle}>
            {!board.isExternal && board.isLocked && (
              <Box sx={isLockedToastStyle}>
                <WarningAmberIcon color="warning" />
                <span>{t("magneto.board.locked")}</span>
              </Box>
            )}
            {board.isExternal && (
              <Box sx={externalToastStyle}>
                <Icon path={mdiEarth} size={1.5} />
                <span style={externalToastTextStyle}>
                  {t("magneto.board.external")}
                </span>
              </Box>
            )}
            {isConnected && (
              <>
                <Chip
                  sx={{
                    ...connectedUsersContainerStyle,
                    backgroundColor: "#F5F7F9",
                    height: "60px",
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
                      padding: "8px 12px",
                    },
                    "& .MuiChip-deleteIcon": {
                      fontSize: "1.8rem",
                      marginLeft: "3px",
                      marginRight: "8px",
                    },
                  }}
                  label={
                    <>
                      {otherConnectedUsers.length > 0 && (
                        <AvatarGroup max={4}>
                          {otherConnectedUsers.map((user) => (
                            <Tooltip
                              key={user.userId}
                              title={
                                user.username || user.name || "Utilisateur"
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
                                  modifiers: [
                                    {
                                      name: "offset",
                                      options: {
                                        offset: [0, -5],
                                      },
                                    },
                                  ],
                                },
                              }}
                            >
                              <Avatar
                                alt={user.username}
                                src={getAvatarURL(user.userId, "user")}
                              ></Avatar>
                            </Tooltip>
                          ))}
                        </AvatarGroup>
                      )}
                      <Tooltip
                        title={edificeClient?.user?.username || "Vous"}
                        placement="bottom"
                        arrow
                        componentsProps={{
                          tooltip: {
                            sx: userTooltipStyle,
                          },
                        }}
                        slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: "offset",
                                options: {
                                  offset: [0, -5],
                                },
                              },
                            ],
                          },
                        }}
                      >
                        <Avatar
                          alt={edificeClient?.user?.username}
                          src={getAvatarURL(
                            edificeClient?.user?.userId || "",
                            "user",
                          )}
                        ></Avatar>
                      </Tooltip>
                    </>
                  }
                  deleteIcon={<ExpandMoreIcon sx={{ fontSize: 40 }} />}
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
                  sx={{
                    "& .MuiPopover-paper": {
                      borderRadius: "12px",
                      boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
                      border: "1px solid #E5E5E5",
                      minWidth: "280px",
                      maxWidth: "320px",
                      mt: 1,
                    },
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    {/* Utilisateur actuel en premier */}
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={getAvatarURL(
                            edificeClient?.user?.userId || "",
                            "user",
                          )}
                          alt={edificeClient?.user?.username}
                          sx={{ width: 40, height: 40 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {edificeClient?.user?.username || "Vous"}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            Éditeur
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider sx={{ mb: 1 }} />

                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      Utilisateurs en ligne ({connectedUsers.length})
                    </Typography>
                    <List sx={{ p: 0, maxHeight: "300px", overflow: "auto" }}>
                      {/* Autres utilisateurs connectés */}
                      {otherConnectedUsers.map((user) => (
                        <ListItem
                          key={user.userId}
                          sx={{ px: 0, paddingBottom: 1 }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              src={getAvatarURL(user.userId, "user")}
                              alt={user.username || user.name}
                              sx={{ width: 40, height: 40 }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 500 }}
                              >
                                {user.username || user.name || "Utilisateur"}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {user.role || "Éditeur"}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Popover>
              </>
            )}
            {boardHasCards() && (
              <Button
                color="primary"
                type="button"
                variant="filled"
                onClick={onClick}
                className="button"
              >
                {t("magneto.read")}
              </Button>
            )}
          </Box>
        </Box>
        {!!board.description && <BoardDescription />}
      </Box>
    </AppHeader>
  );
};
