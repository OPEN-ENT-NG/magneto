import { useRef, useEffect, useState, FC } from "react";

import { Box, Button } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  boardDescriptionWrapperSyle,
  buttonStyle,
  StyledTypography,
} from "./style";
import { DescriptionModal } from "../description-modal/DescriptionModal";
import { useBoard } from "~/providers/BoardProvider";

export const BoardDescription: FC = () => {
  const {
    board: { description, title },
  } = useBoard();
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const textRef = useRef<HTMLElement>(null);
  const { t } = useTranslation("magneto");

  const checkOverflow = () => {
    if (textRef.current) {
      setIsOverflowing(
        textRef.current.scrollHeight > textRef.current.clientHeight,
      );
    }
  };

  const toggleIsOpen = () => {
    setIsOpen((prevState) => !prevState);
  };

  useEffect(() => {
    checkOverflow();
  }, [description]);

  return (
    <Box sx={boardDescriptionWrapperSyle}>
      <StyledTypography isOverflowing={isOverflowing} ref={textRef}>
        {description}
      </StyledTypography>
      {isOverflowing && (
        <Button onClick={toggleIsOpen} sx={buttonStyle}>
          {t("magneto.board.description.readmore")}
        </Button>
      )}
      {isOpen && (
        <DescriptionModal
          open={isOpen}
          onClose={toggleIsOpen}
          description={description}
          title={title}
        />
      )}
    </Box>
  );
};
