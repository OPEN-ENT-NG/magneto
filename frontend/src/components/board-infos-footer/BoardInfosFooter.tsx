import { FC, useMemo } from "react";

import { Button } from "@edifice-ui/react";
import {
  mdiAccountCircle,
  mdiCalendarBlank,
  mdiEarth,
  mdiMagnet,
  mdiShareVariant,
} from "@mdi/js";
import Icon from "@mdi/react";
import { Box, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { buttonStyle, typographyFooterStyle } from "./style";
import { BoardInfosFooterProps } from "./types";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { useGetBoardsByIdsQuery } from "~/services/api/boards.service";

export const BoardInfosFooter: FC<BoardInfosFooterProps> = ({ card }) => {
  const typographyStyle = {
    fontSize: "1.6rem",
  };
  const { t } = useTranslation("magneto");
  const navigate = useNavigate();

  const { currentData: myBoardsResult } = useGetBoardsByIdsQuery([
    card.boardId,
  ]);

  const board = useMemo(() => {
    return myBoardsResult && myBoardsResult.all[0]
      ? new Board().build(myBoardsResult.all[0] as IBoardItemResponse)
      : new Board();
  }, [myBoardsResult]);

  return (
    <Box sx={{ mt: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={3}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Icon path={mdiAccountCircle} size={1.5} />
            <Typography sx={typographyStyle}>
              {t("magneto.board.owner")} : {board.owner.displayName}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Icon path={mdiMagnet} size={1.5} style={{ color: "#ffb600" }} />
            <Typography sx={typographyStyle}>
              {board.layoutType == LAYOUT_TYPE.FREE
                ? board.nbCards
                : board.nbCardsSections}{" "}
              {t("magneto.magnets")}
            </Typography>
          </Stack>
          {board.isPublished && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Icon path={mdiEarth} size={1.5} />
              <Typography sx={typographyFooterStyle}>
                {t("magneto.board.tooltip.public.board")}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Stack direction="row" spacing={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Icon path={mdiCalendarBlank} size={1.5} />
            <Typography sx={typographyFooterStyle}>
              {dayjs(board.modificationDate, {
                locale: "fr",
                format: "YYYY-MM-DD HH:mm:ss",
              }).format("DD MMMM YYYY")}
            </Typography>
          </Stack>

          {board.shared.length && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Icon path={mdiShareVariant} size={1.5} />
              <Typography sx={typographyFooterStyle}>
                {t("magneto.board.tooltip.shared.board")}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Stack direction="row" alignItems="flex-start">
          <Button
            color="primary"
            type="button"
            variant="filled"
            onClick={(e) => {
              if (e.ctrlKey) {
                window.open(`/board/${board.id}/view`, "_blank");
              } else {
                navigate(`/board/${board.id}/view`);
              }
            }}
            style={buttonStyle}
          >
            {t("magneto.board.see")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
