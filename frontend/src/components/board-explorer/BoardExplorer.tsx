import { FC, useEffect, useMemo, useState } from "react";
import { Button } from "@edifice-ui/react";
import {
  Box,
  FormControl,
  GlobalStyles,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { useBoard } from "~/providers/BoardProvider";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";

import { useNavigate } from "react-router-dom";
import { Section } from "~/providers/BoardProvider/types";
import { useTranslation } from "react-i18next";
import { Card } from "~/models/card.model";
import {
  boxStyle,
  contentStyle,
  inputLabelStyle,
  menuItemStyle,
  retourStyle,
  selectStyle,
} from "./style";
import {
  commentButtonStyle,
  CommentContainer,
  contentWrapper,
  modalBodyStyle,
} from "../Preview-modal/style";
import { PreviewContent } from "../preview-content/PreviewContent";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { CommentPanel } from "../comment-panel/CommentPanel";
import { useWindowResize } from "~/hooks/useWindowResize";

export const BoardExplorer: FC = () => {
  const {
    board,
    displayModals: { COMMENT_PANEL },
    toggleBoardModals,
  } = useBoard();
  const navigate = useNavigate();
  const { t } = useTranslation("magneto");
  const [isRefReady, setIsRefReady] = useState(false);
  const commentDivRef = useWindowResize();

  const filteredSections = useMemo(() => {
    return board.sections.filter(
      (section) => section.cards && section.cards.length > 0,
    );
  }, [board]);

  useEffect(() => {
    if (COMMENT_PANEL && commentDivRef.current) {
      setIsRefReady(true);
    } else {
      setIsRefReady(false);
    }
  }, [COMMENT_PANEL]);

  const navigateToView = () => {
    navigate(`/board/${board.id}/view`);
  };

  const initialCards = useMemo(() => {
    return board.isLayoutFree()
      ? board.cards
      : filteredSections.flatMap((section) => section.cards || []);
  }, [board]);

  const [card, setCard] = useState(initialCards[0]);
  const [cardIndex, setCardIndex] = useState(0);
  const [section, setSection] = useState<Section | null>(
    board.isLayoutFree() ? filteredSections[0] : null,
  );

  useEffect(() => {
    setCard(initialCards[0]);
  }, [initialCards]);

  useEffect(() => {
    setSection(filteredSections[0]);
  }, [filteredSections]);

  const navigatePage = (direction: "next" | "prev") => {
    const newIndex = direction === "next" ? cardIndex + 1 : cardIndex - 1;
    const newCard = initialCards[newIndex];

    if (board.isLayoutFree()) {
      const newSection = filteredSections.find((s) =>
        s.cards.some((card) => card.id === newCard.id),
      );
      if (newSection) {
        setSection(newSection);
      }
    }

    setCard(newCard);
    setCardIndex(newIndex);
  };

  const isLastCardInBoard = (): boolean => {
    const cards = board.isLayoutFree() ? board.cards : initialCards;
    return card === cards[cards.length - 1];
  };

  const handleSectionChange = (event: SelectChangeEvent<string>) => {
    const sectionId = event.target.value;
    const selectedSection = filteredSections.find(
      (sectionSelected) => sectionSelected._id === sectionId,
    );
    if (selectedSection) {
      setSection(selectedSection);

      const index = initialCards.findIndex(
        (selectedCard: Card) =>
          selectedCard.id === selectedSection?.cards[0].id,
      );
      setCard(initialCards[index]);
      setCardIndex(index);
    }
  };

  return (
    <>
      <GlobalStyles
        styles={{
          "main.container-fluid": {
            width: " 65% !important",
            maxWidth: "100% !important",
            position: "relative",
            paddingRight: "0 !important",
            paddingLeft: "0 !important",
          },
        }}
      />
      {filteredSections && section && (
        <FormControl size="medium" variant="filled" fullWidth>
          <InputLabel id="select-label" sx={inputLabelStyle}>
            {t("magneto.card.section")}
          </InputLabel>
          <Select
            labelId="select-section"
            id="select-section"
            value={section?._id}
            onChange={handleSectionChange}
            label={t("magneto.card.section")}
            sx={selectStyle}
          >
            {filteredSections.map((s: Section) => (
              <MenuItem key={s._id} value={s._id} sx={menuItemStyle}>
                {s.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Button
        color="primary"
        type="submit"
        variant="filled"
        className="retour-button"
        onClick={navigateToView}
        style={retourStyle}
      >
        {"<- Retour"}
      </Button>

      <Box sx={contentStyle}>
        <Box sx={boxStyle}>
          {cardIndex > 0 && (
            <IconButton
              sx={{
                position: "fixed",
                left: "6%",
                top: "50%",
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                "&:hover": { backgroundColor: "white" },
                width: "7rem",
                height: "7rem",
                boxShadow: "0 3px 5px rgba(0,0,0,0.1)",
                "& .MuiSvgIcon-root": {
                  fontSize: "5rem",
                },
              }}
              onClick={() => navigatePage("prev")}
            >
              <ChevronLeftIcon sx={{ color: "black" }} />
            </IconButton>
          )}
          {!isLastCardInBoard() && (
            <IconButton
              sx={{
                position: "fixed",
                right: "6%",
                top: "50%",
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                "&:hover": { backgroundColor: "white" },
                width: "7rem",
                height: "7rem",
                boxShadow: "0 3px 5px rgba(0,0,0,0.1)",
                "& .MuiSvgIcon-root": {
                  fontSize: "5rem",
                },
              }}
              onClick={() => navigatePage("next")}
            >
              <ChevronRightIcon sx={{ color: "black" }} />
            </IconButton>
          )}
        </Box>
        <Box>
          <Box sx={modalBodyStyle}>
            <Box sx={contentWrapper} data-scrollable="true">
              {card && <PreviewContent card={card} />}
            </Box>
            <CommentContainer isVisible={COMMENT_PANEL} />
            {board.canComment && !COMMENT_PANEL && (
              <IconButton
                onClick={() =>
                  toggleBoardModals(BOARD_MODAL_TYPE.COMMENT_PANEL)
                }
                aria-label="close"
                sx={commentButtonStyle}
              >
                <Typography fontSize="inherit">{card?.nbOfComments}</Typography>
                <ForumOutlinedIcon fontSize="inherit" />
              </IconButton>
            )}
          </Box>
          {card && COMMENT_PANEL && isRefReady && (
            <CommentPanel
              cardId={card.id}
              anchorEl={commentDivRef.current}
              isInCardPreview
            />
          )}
        </Box>
      </Box>
    </>
  );
};
