import { FC } from "react";

import "./HeaderView.scss";

import {
  AppHeader,
  Breadcrumb,
  Button,
  useEdificeClient,
} from "@edifice.io/react";
import { mdiCheckCircle } from "@mdi/js";
import Icon from "@mdi/react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  leftWrapperStyle,
  mainWrapperStyle,
  rightWrapperStyle,
  toastStyle,
  wrapperBoxStyle,
} from "./style";
import { BoardDescription } from "../board-description/BoardDescription";
import { useBoard } from "~/providers/BoardProvider";
import { Section } from "~/providers/BoardProvider/types";

export const HeaderView: FC = () => {
  const { board } = useBoard();
  const navigate = useNavigate();
  const { currentApp } = useEdificeClient();
  const { t } = useTranslation("magneto");
  const modificationDate = board.modificationDate.split(" ")[0];
  const modificationHour = board.modificationDate.split(" ")[1];
  const onClick = () => navigate(`/board/${board.id}/read`);

  const boardHasCards = (): boolean => {
    return (
      !!board.cardIds?.length ||
      !!(board.sections ?? []).find(
        (section: Section) => !!section.cardIds.length,
      )
    );
  };

  return (
    <AppHeader className="header-view">
      <Box sx={mainWrapperStyle}>
        <Box sx={wrapperBoxStyle}>
          <Box sx={leftWrapperStyle}>
            {currentApp && <Breadcrumb app={currentApp} name={board?.title} />}
          </Box>
          <Box sx={rightWrapperStyle}>
            <Box sx={toastStyle}>
              <Icon path={mdiCheckCircle} size={1} />
              <span>
                {t("magneto.board.saved.at", {
                  0: modificationDate,
                  1: modificationHour,
                })}
              </span>
            </Box>
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
