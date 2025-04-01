import { FC, useMemo } from "react";

import { Button, useEdificeClient } from "@edifice.io/react";
import {
  mdiAccountCircle,
  mdiCalendarBlank,
  mdiCrown,
  mdiEarth,
  mdiMagnet,
  mdiShareVariant,
} from "@mdi/js";
import Icon from "@mdi/react";
import { Box, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { buttonStyle, typographyFooterStyle } from "./style";
import { BoardInfosFooterProps } from "./types";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { useBoard } from "~/providers/BoardProvider";
import {
  useGetBoardsByIdsQuery,
  useGetBoardsByIdsPublicQuery,
} from "~/services/api/boards.service";

export const BoardInfosFooter: FC<BoardInfosFooterProps> = ({ card }) => {
  const typographyStyle = {
    fontSize: "1.6rem",
  };
  const { t } = useTranslation("magneto");

  const { closeActiveCardAction, isExternalView } = useBoard();
  const { user } = useEdificeClient();

  const { currentData: privateBoardsResult } = useGetBoardsByIdsQuery(
    isExternalView ? [] : [card.resourceUrl],
    { skip: isExternalView },
  );

  const { currentData: publicBoardsResult } = useGetBoardsByIdsPublicQuery(
    isExternalView ? [card.resourceUrl] : [],
    { skip: !isExternalView },
  );

  const myBoardsResult = isExternalView
    ? publicBoardsResult
    : privateBoardsResult;

  const board = useMemo(() => {
    return myBoardsResult && myBoardsResult.all[0]
      ? new Board().build(myBoardsResult.all[0] as IBoardItemResponse)
      : new Board();
  }, [myBoardsResult]);

  const amIBoardOwner = board.owner.userId === user?.userId;

  return (
    <Box sx={{ mt: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={3}>
          {amIBoardOwner ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Icon path={mdiCrown} size={1.5} />
              <Typography sx={typographyStyle}>
                {t("magneto.board.tooltip.my.board")}
              </Typography>
            </Stack>
          ) : (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Icon path={mdiAccountCircle} size={1.5} />
              <Typography sx={typographyStyle}>
                {t("magneto.board.owner")} : {board.owner.displayName}
              </Typography>
            </Stack>
          )}

          <Stack direction="row" alignItems="center" spacing={1}>
            <Icon path={mdiMagnet} size={1.5} style={{ color: "#ffb600" }} />
            <Typography sx={typographyStyle}>
              {board.layoutType === LAYOUT_TYPE.FREE
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
              {dayjs(board.modificationDate ?? board.creationDate, {
                locale: "fr",
                format: "YYYY-MM-DD HH:mm:ss",
              }).format("DD MMMM YYYY")}
            </Typography>
          </Stack>

          {!!board.shared.length && (
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
              if (e.ctrlKey || e.metaKey) {
                window.open(
                  `/magneto#/board/${card.resourceUrl}/view`,
                  "_blank",
                );
              } else if (e.button === 0) {
                window.location.href = `/magneto#/board/${card.resourceUrl}/view`;
              }
              closeActiveCardAction(BOARD_MODAL_TYPE.CARD_PREVIEW);
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
