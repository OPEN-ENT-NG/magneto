import { FC, useState } from "react";

import { LoadingScreen, useToast } from "@edifice.io/react";
import { Autocomplete, Box, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  autocompleteInputStyles,
  autocompleteLabelStyles,
  autocompleteOptionStyles,
  autocompleteStyles,
  bodyModalWrapper,
} from "./style";
import { CardDuplicateOrMoveModalProps } from "./types";
import { prepareI18nByModalType, prepareSortedBoards } from "./utils";
import { MessageModal } from "../message-modal/MessageModal";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { WEBSOCKET_MESSAGE_TYPE } from "~/core/enums/websocket-message-type";
import { CardForm } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";
import { useWebSocketMagneto } from "~/providers/WebsocketProvider";
import { useGetAllBoardsEditableQuery } from "~/services/api/boards.service";
import {
  useDuplicateCardMutation,
  useMoveCardMutation,
} from "~/services/api/cards.service";

export const CardDuplicateOrMoveModal: FC<CardDuplicateOrMoveModalProps> = ({
  isOpen,
}) => {
  const { data: editableBoards } = useGetAllBoardsEditableQuery(undefined, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });
  const { isModalDuplicate, closeActiveCardAction, board, activeCard } =
    useBoard();
  const [duplicate] = useDuplicateCardMutation();
  const [move] = useMoveCardMutation();
  const { sendMessage, readyState } = useWebSocketMagneto();
  const toast = useToast();
  const { t } = useTranslation("magneto");
  const { title, label, button, sucess, error } =
    prepareI18nByModalType(isModalDuplicate);
  const [inputValue, setInputValue] = useState(
    isModalDuplicate ? board._id : "",
  );

  const sortedBoards = prepareSortedBoards(
    editableBoards,
    isModalDuplicate,
    board._id,
  );
  const handleSubmit = async () => {
    if (!inputValue || !activeCard?.id) return;

    try {
      if (isModalDuplicate) {
        if (readyState === WebSocket.OPEN) {
          sendMessage(
            JSON.stringify({
              type: WEBSOCKET_MESSAGE_TYPE.CARD_DUPLICATED,
              boardId: inputValue,
              cardIds: [activeCard.id],
            }),
          );
        } else {
          await duplicate({
            boardId: inputValue,
            cardIds: [activeCard.id],
          });
        }
      } else {
        if (readyState === WebSocket.OPEN) {
          sendMessage(
            JSON.stringify({
              type: WEBSOCKET_MESSAGE_TYPE.CARD_MOVED,
              boardId: inputValue,
              card: new CardForm().build(activeCard).toJSON(),
            }),
          );
        } else {
          await move({
            boardId: inputValue,
            card: new CardForm().build(activeCard).toJSON(),
          });
        }
      }
      toast.success(t(sucess));
      closeActiveCardAction(BOARD_MODAL_TYPE.DUPLICATE_OR_MOVE);
    } catch {
      toast.error(t(error));
    }
  };
  return (
    <MessageModal
      submitButtonName={t(button)}
      cancelButtonName={t("magneto.cancel")}
      title={t(title)}
      isOpen={isOpen}
      onClose={() => closeActiveCardAction(BOARD_MODAL_TYPE.DUPLICATE_OR_MOVE)}
      disableSubmit={() => {
        return !inputValue;
      }}
      onSubmit={handleSubmit}
    >
      <Box sx={bodyModalWrapper}>
        {t(label)}
        {sortedBoards.length ? (
          <Autocomplete
            value={sortedBoards.find((item) => item.id === inputValue) || null}
            onChange={(_, newValue) => {
              setInputValue(newValue?.id || "");
            }}
            options={sortedBoards}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("magneto.board")}
                InputLabelProps={{
                  sx: autocompleteLabelStyles,
                }}
                inputProps={{
                  ...params.inputProps,
                  style: autocompleteInputStyles,
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} style={autocompleteOptionStyles}>
                {option.name}
              </li>
            )}
            sx={autocompleteStyles}
          />
        ) : (
          <LoadingScreen />
        )}
      </Box>
    </MessageModal>
  );
};
