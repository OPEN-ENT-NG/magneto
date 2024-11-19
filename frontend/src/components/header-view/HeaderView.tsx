import { FC } from "react";

import { AppHeader, Breadcrumb, Button, useOdeClient } from "@edifice-ui/react";
import { mdiCheckCircle } from "@mdi/js";
import Icon from "@mdi/react";
import "./HeaderView.scss";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import { leftWrapperStyle, toastStyle, wrapperBoxStyle } from "./style";
import { useBoard } from "~/providers/BoardProvider";

export const HeaderView: FC = () => {
  const { board } = useBoard();
  const { currentApp } = useOdeClient();
  const { t } = useTranslation("magneto");
  console.log(board);
  const modificationDate = board.modificationDate.split(" ")[0];
  const modificationHour = board.modificationDate.split(" ")[1];
  const onClick = () => console.log("read clicked");

  return (
    <AppHeader>
      <Box sx={wrapperBoxStyle}>
        {currentApp && <Breadcrumb app={currentApp} name={board?.title} />}
        <Box sx={leftWrapperStyle}>
          <Box sx={toastStyle}>
            <Icon path={mdiCheckCircle} size={1} />
            <span>
              {t("magneto.board.saved.at", {
                0: modificationDate,
                1: modificationHour,
              })}
            </span>
          </Box>
          <Button
            color="primary"
            type="button"
            variant="filled"
            onClick={onClick}
            className="button"
          >
            {t("magneto.read")}
          </Button>
        </Box>
      </Box>
    </AppHeader>
  );
};
