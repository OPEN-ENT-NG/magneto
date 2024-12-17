import { FC, useMemo, useState } from "react";

import { Button, SearchBar, useToast } from "@edifice-ui/react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Modal, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  closeButtonStyle,
  contentContainerStyle,
  duplicateButtonStyle,
  headerStyle,
  modalContainerStyle,
  modalFooterStyle,
  titleStyle,
} from "./style";
import { InputValueState, BoardCreateMagnetBoardModalProps } from "./types";
import { initialInputvalue } from "./utils";
import { BoardList } from "../board-list/BoardList";
import { TabList } from "../tab-list/TabList";
import { CURRENTTAB_STATE } from "../tab-list/types";
import { BOARD_TABS_CONFIG } from "../tab-list/utils";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { useBoard } from "~/providers/BoardProvider";
import { useGetAllBoardsQuery } from "~/services/api/boards.service";
import { useDuplicateCardMutation } from "~/services/api/cards.service";

export const BoardCreateMagnetBoardModal: FC<
  BoardCreateMagnetBoardModalProps
> = ({ open, onClose }) => {
  const { board } = useBoard();
  const [inputValue, setInputValue] =
    useState<InputValueState>(initialInputvalue);
  const { currentTab } = inputValue;
  const { t } = useTranslation("magneto");
  const [duplicateCard] = useDuplicateCardMutation();
  const toast = useToast();

  const { data: myBoardsResult, isLoading: boardsLoading } =
    useGetAllBoardsQuery({
      isPublic: currentTab === CURRENTTAB_STATE.PUBLIC,
      isShared: currentTab === CURRENTTAB_STATE.SHARED,
      isDeleted: false,
      sortBy: "modificationDate",
      page: 0,
    });

  const boards = useMemo(() => {
    return (
      myBoardsResult?.all?.map((board: IBoardItemResponse) =>
        new Board().build(board),
      ) || []
    );
  }, [myBoardsResult]);

  const handleTabChange = (newValue: CURRENTTAB_STATE) => {
    setInputValue((prevState) => ({
      ...prevState,
      currentTab: newValue,
      cardIds: [],
    }));
  };
  const handleSearchChange = (newValue: string) => {
    setInputValue((prevState) => ({
      ...prevState,
      search: newValue,
      cardIds: [],
    }));
  };

  const onCloseModal = () => {
    setInputValue(initialInputvalue);
    onClose();
  };

  const handleSubmit = async () => {
    if (inputValue.cardIds) {
      const magnetMagnetParams = {
        boardId: board._id,
        cardIds: inputValue.cardIds,
      };
      try {
        await duplicateCard(magnetMagnetParams);
        toast.success(t("magneto.duplicate.cards.confirm"));
        onCloseModal();
      } catch (err) {
        console.error("failed to duplicate cards");
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-create-magnet-magnet"
    >
      <Box sx={modalContainerStyle}>
        <Box sx={headerStyle}>
          <Typography
            id="modal-title"
            variant="h4"
            component="h2"
            sx={titleStyle}
          >
            {t("magneto.boards.collection")}
          </Typography>
          <IconButton
            onClick={onClose}
            aria-label="close"
            sx={closeButtonStyle}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
        <Box sx={{ width: "100%", padding: "2rem 10%", margin: "auto" }}>
          <SearchBar
            onChange={(e) => {
              handleSearchChange(e.target.value);
            }}
            placeholder={t("magneto.search.placeholder")}
            size="md"
            isVariant
            className="searchbar"
          />
        </Box>
        <Box
          sx={{
            width: "100%",
            pb: "1rem",
            margin: "auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TabList
            currentTab={currentTab}
            onChange={handleTabChange}
            tabsConfig={BOARD_TABS_CONFIG}
          />
        </Box>
        <Box sx={contentContainerStyle}>
          <BoardList
            searchText={inputValue.search}
            onDragAndDrop={() => {}}
            boards={boards}
            boardsLoading={boardsLoading}
          />
        </Box>
        <Box sx={modalFooterStyle}>
          <Box sx={duplicateButtonStyle}>
            <Button
              color="tertiary"
              type="button"
              variant="ghost"
              onClick={() => onCloseModal()}
            >
              {t("magneto.cancel")}
            </Button>
            <Button
              onClick={() => handleSubmit()}
              disabled={!inputValue.cardIds?.length}
            >
              {t("magneto.card.options.duplicate")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};
