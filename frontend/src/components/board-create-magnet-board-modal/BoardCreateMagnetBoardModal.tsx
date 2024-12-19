import { FC, useState } from "react";

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
import { useRenderContent } from "./useRenderContent";
import { initialInputvalue } from "./utils";
import { TabList } from "../tab-list/TabList";
import { CURRENTTAB_STATE } from "../tab-list/types";
import { BOARD_TABS_CONFIG } from "../tab-list/utils";
import { useBoard } from "~/providers/BoardProvider";

export const BoardCreateMagnetBoardModal: FC<
  BoardCreateMagnetBoardModalProps
> = ({ open, onClose }) => {
  const { board } = useBoard();
  const [inputValue, setInputValue] =
    useState<InputValueState>(initialInputvalue);
  const { currentTab } = inputValue;
  const { t } = useTranslation("magneto");
  const toast = useToast();

  const handleTabChange = (newValue: CURRENTTAB_STATE) => {
    setInputValue((prevState) => ({
      ...prevState,
      currentTab: newValue,
      selectedBoardId: null,
    }));
  };

  const handleSearchChange = (newValue: string) => {
    setInputValue((prevState) => ({
      ...prevState,
      search: newValue,
      selectedBoardId: null,
    }));
  };

  const onCloseModal = () => {
    setInputValue(initialInputvalue);
    onClose();
  };

  const handleSubmit = async () => {
    if (inputValue.selectedBoardId) {
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
          {useRenderContent(inputValue, setInputValue)}
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
              disabled={!inputValue.selectedBoardId}
            >
              {t("magneto.card.options.duplicate")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};
