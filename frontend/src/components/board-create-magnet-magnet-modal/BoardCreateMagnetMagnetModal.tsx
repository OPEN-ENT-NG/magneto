import { FC, useState } from "react";

import { Button, SearchBar, useToast } from "@edifice.io/react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  FormGroup,
  IconButton,
  Modal,
  Switch,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  closeButtonStyle,
  contentContainerStyle,
  duplicateButtonStyle,
  formGroupStyle,
  headerStyle,
  modalContainerStyle,
  modalFooterStyle,
  StyledFormControlLabel,
  titleStyle,
} from "./style";
import { BoardCreateMagnetMagnetModalProps, InputValueState } from "./types";
import { useRenderContent } from "./useRenderContent";
import { initialInputvalue } from "./utils";
import { TabList } from "../tab-list/TabList";
import { CURRENTTAB_STATE } from "../tab-list/types";
import { WEBSOCKET_MESSAGE_TYPE } from "~/core/enums/websocket-message-type";
import { useBoard } from "~/providers/BoardProvider";
import { useWebSocketMagneto } from "~/providers/WebsocketProvider";
import { useDuplicateCardMutation } from "~/services/api/cards.service";

export const BoardCreateMagnetMagnetModal: FC<
  BoardCreateMagnetMagnetModalProps
> = ({ open, onClose }) => {
  const { board } = useBoard();
  const [inputValue, setInputValue] =
    useState<InputValueState>(initialInputvalue);
  const { currentTab, isByBoards, isByFavorite } = inputValue;
  const { sendMessage, readyState } = useWebSocketMagneto();
  const { t } = useTranslation("magneto");
  const [duplicateCard] = useDuplicateCardMutation();
  const toast = useToast();

  const handleSwitchChange = (key: "isByBoards" | "isByFavorite") => {
    setInputValue((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
      cardIds: key === "isByFavorite" ? [] : prevState.cardIds,
    }));
  };

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
        if (readyState === WebSocket.OPEN) {
          sendMessage(
            JSON.stringify({
              type: WEBSOCKET_MESSAGE_TYPE.CARD_DUPLICATED,
              ...magnetMagnetParams,
            }),
          );
        } else {
          await duplicateCard(magnetMagnetParams);
        }
        toast.success(t("magneto.duplicate.cards.confirm"));
        onCloseModal();
      } catch {
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
            {t("magneto.cards.collection")}
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
          <TabList currentTab={currentTab} onChange={handleTabChange} />
        </Box>
        <FormGroup sx={formGroupStyle}>
          <StyledFormControlLabel
            control={
              <Switch
                checked={isByBoards}
                onChange={() => handleSwitchChange("isByBoards")}
              />
            }
            label={t("magneto.cards.collection.board.view")}
          />
          {currentTab !== CURRENTTAB_STATE.FAVORTIE && (
            <StyledFormControlLabel
              control={
                <Switch
                  checked={isByFavorite}
                  onChange={() => handleSwitchChange("isByFavorite")}
                />
              }
              label={t("magneto.cards.collection.favorite.view")}
            />
          )}
        </FormGroup>
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
