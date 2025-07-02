import { FC } from "react";

import "./HeaderView.scss";

import { IWebApp } from "@edifice.io/client";
import {
  AppHeader,
  Breadcrumb,
  Button,
  useEdificeClient,
} from "@edifice.io/react";
import { mdiCheckCircle, mdiEarth } from "@mdi/js";
import Icon from "@mdi/react";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Avatar, AvatarGroup, Box, Tooltip, Typography } from "@mui/material";
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
  toastStyle,
  userTooltipStyle,
  wrapperBoxStyle,
} from "./style";
import { BoardDescription } from "../board-description/BoardDescription";
import useDirectory from "~/hooks/useDirectory";
import { useBoard } from "~/providers/BoardProvider";
import { Section } from "~/providers/BoardProvider/types";
import {
  useConnectedUsers,
  useWebSocketManager,
} from "~/services/websocket/useWebSocketManager";

export const HeaderView: FC = () => {
  const { board, isExternalView } = useBoard();
  const { getAvatarURL } = useDirectory();
  const navigate = useNavigate();

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
  const { isConnected } = useWebSocketManager();
  const connectedUsers = useConnectedUsers();
  const { currentApp } = isExternalView
    ? { currentApp: magnetoWebApp }
    : edificeClient;
  const { t } = useTranslation("magneto");
  const modificationDate = board.modificationDate.split(" ")[0];
  const modificationHour = board.modificationDate.split(" ")[1];
  const onClick = () =>
    navigate(
      isExternalView ? `/pub/${board.id}/read` : `/board/${board.id}/read`,
    );

  const boardHasCards = (): boolean => {
    return (
      !!board.cardIds?.length ||
      !!(board.sections ?? []).find(
        (section: Section) => !!section.cardIds.length,
      )
    );
  };

  const otherConnectedUsers = connectedUsers.filter(
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
              <Box sx={connectedUsersContainerStyle}>
                {otherConnectedUsers.length > 0 && (
                  <AvatarGroup max={4}>
                    {otherConnectedUsers.map((user) => (
                      <Tooltip
                        key={user.userId}
                        title={user.username || user.name || "Utilisateur"}
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
              </Box>
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
