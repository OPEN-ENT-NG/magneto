import { FC, useState } from "react";

import { LoadingScreen } from "@edifice-ui/react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { CardDuplicateOrMoveModalProps } from "./types";
import { prepareI18nByModalType, transformAndSortBoards } from "./utils";
import { MessageModal } from "../message-modal/MessageModal";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { useBoard } from "~/providers/BoardProvider";
import { useGetAllBoardsEditableQuery } from "~/services/api/boards.service";

export const CardDuplicateOrMoveModal: FC<CardDuplicateOrMoveModalProps> = ({
  isOpen,
}) => {
  const { data: editableBoards } = useGetAllBoardsEditableQuery(undefined, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });
  const { isModalDuplicate, closeActiveCardAction } = useBoard();
  const { t } = useTranslation("magneto");
  const { title, label, button } = prepareI18nByModalType(isModalDuplicate);
  const [inputValue, setInputValue] = useState("");

  const sortedBoards = editableBoards
    ? transformAndSortBoards(editableBoards.all)
    : [];
  
  const displayedName =
    sortedBoards.find((item) => inputValue === item.id)?.name ?? "";

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
  };
  
  return (
    <MessageModal
      submitButtonName={t(button)}
      title={t(title)}
      isOpen={isOpen}
      onClose={() => closeActiveCardAction(BOARD_MODAL_TYPE.DUPLICATE_OR_MOVE)}
      onSubmit={() => null}
    >
      {sortedBoards.length ? (
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">{displayedName}</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={inputValue}
            label="Age"
            onChange={handleChange}
          >
            {sortedBoards.map((item) => (
              <MenuItem value={item.id}>{item.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <LoadingScreen />
      )}
      {t(label)}
    </MessageModal>
  );
};
