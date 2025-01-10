import { FC, useState } from "react";

import { Button, SearchBar } from "@edifice-ui/react";
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
import { useMediaLibrary } from "~/providers/MediaLibraryProvider";

export const BoardCreateMagnetBoardModal: FC<
  BoardCreateMagnetBoardModalProps
> = ({ open, onClose }) => {
  const [inputValue, setInputValue] =
    useState<InputValueState>(initialInputvalue);
  const { currentTab } = inputValue;
  const { t } = useTranslation("magneto");
  const { setIsCreateMagnetOpen, setSelectedBoardData } = useMediaLibrary();

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

  const handleClose = () => {
    setInputValue(initialInputvalue);
    onClose();
  };

  const handleSubmit = async () => {
    if (inputValue.selectedBoard) {
      setSelectedBoardData(inputValue.selectedBoard);
      setIsCreateMagnetOpen(true);
      handleClose();
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
              onClick={() => handleClose()}
            >
              {t("magneto.cancel")}
            </Button>
            <Button
              onClick={() => handleSubmit()}
              disabled={!inputValue.selectedBoard}
            >
              {t("magneto.add")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};
