import {
  FC,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Button } from "@edifice.io/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
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
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  blackColor,
  boxStyle,
  commentButtonWrapperStyle,
  contentStyle,
  inputLabelStyle,
  leftNavigationStyle,
  menuItemStyle,
  retourStyle,
  rightNavigationStyle,
  selectStyle,
  styledContentBox,
  whiteColor,
} from "./style";
import { CommentPanel } from "../comment-panel/CommentPanel";
import { PreviewContent } from "../preview-content/PreviewContent";
import { commentButtonStyle, CommentContainer } from "../Preview-modal/style";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { useWindowResize } from "~/hooks/useWindowResize";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";
import { Section } from "~/providers/BoardProvider/types";

export const ReadView: FC = () => {
  const {
    board,
    displayModals: { COMMENT_PANEL },
    toggleBoardModals,
    isExternalView,
  } = useBoard();
  const navigate = useNavigate();
  const { t } = useTranslation("magneto");
  const [isRefReady, setIsRefReady] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const filteredSections = useMemo(() => {
    return board.sections.filter(
      (section) => section.cards && section.cards.length > 0,
    );
  }, [board]);
  const [section, setSection] = useState<Section | null>(
    board.isLayoutFree() ? filteredSections[0] : null,
  );
  const commentDivRef =
    useWindowResize() as MutableRefObject<HTMLElement | null>;

  useEffect(() => {
    if (COMMENT_PANEL && commentDivRef.current) {
      setIsRefReady(true);
    } else {
      setIsRefReady(false);
    }
  }, [COMMENT_PANEL]);

  const navigateToView = () => {
    navigate(isExternalView ? `/pub/${board.id}` : `/board/${board.id}/view`);
  };

  const initialCards = useMemo(() => {
    return board.isLayoutFree()
      ? board.cards
      : filteredSections.flatMap((section) => section.cards || []);
  }, [board]);

  useEffect(() => {
    if (!card) return setCard(initialCards[0]);
  }, [board]);

  useEffect(() => {
    if (!section) setSection(filteredSections[0]);
  }, [filteredSections]);

  const navigatePage = (direction: "next" | "prev") => {
    const newIndex = direction === "next" ? cardIndex + 1 : cardIndex - 1;
    const newCard = initialCards[newIndex];

    if (!board.isLayoutFree()) {
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

  const handleKeyNavigation = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && cardIndex > 0) {
        navigatePage("prev");
      } else if (event.key === "ArrowRight" && !isLastCardInBoard()) {
        navigatePage("next");
      }
    },
    [cardIndex, isLastCardInBoard, navigatePage],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyNavigation);

    return () => {
      window.removeEventListener("keydown", handleKeyNavigation);
    };
  }, [handleKeyNavigation]);

  useEffect(() => {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      commentDivRef.current = rootElement;
      const originalGetBoundingClientRect =
        rootElement.getBoundingClientRect.bind(rootElement);
      rootElement.getBoundingClientRect = () => {
        const originalRect = originalGetBoundingClientRect();
        return new DOMRect(
          originalRect.x - 20,
          originalRect.y + 4,
          originalRect.width,
          originalRect.height,
        );
      };
    }
  }, []);

  return (
    <>
      <GlobalStyles
        styles={{
          "main.container-fluid": {
            width: " 65% !important",
            maxWidth: "100% !important",
            minHeight: "calc(100vh - 70px)",
            maxHeight: "calc(100vh - 70px)",
            position: "relative",
            paddingRight: "0 !important",
            paddingLeft: "0 !important",
            boxSizing: "border-box",
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
            {filteredSections.map((section: Section) => (
              <MenuItem
                key={section._id}
                value={section._id}
                sx={menuItemStyle}
              >
                {section.title}
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
        <ArrowBackIcon sx={whiteColor} />
        {t("magneto.previous")}
      </Button>

      <Box sx={contentStyle} data-scrollable="true">
        <Box sx={boxStyle}>
          {cardIndex > 0 && (
            <IconButton
              sx={leftNavigationStyle}
              onClick={() => navigatePage("prev")}
            >
              <ChevronLeftIcon sx={blackColor} />
            </IconButton>
          )}
          {!isLastCardInBoard() && (
            <IconButton
              sx={rightNavigationStyle}
              onClick={() => navigatePage("next")}
            >
              <ChevronRightIcon sx={blackColor} />
            </IconButton>
          )}
        </Box>
        <Box>
          <Box sx={styledContentBox}>
            {card && <PreviewContent card={card} />}
            <Box sx={commentButtonWrapperStyle}>
              <CommentContainer isVisible={COMMENT_PANEL} />
              {board.canComment && !COMMENT_PANEL && (
                <IconButton
                  onClick={() =>
                    toggleBoardModals(BOARD_MODAL_TYPE.COMMENT_PANEL)
                  }
                  aria-label="close"
                  sx={commentButtonStyle}
                >
                  <Typography fontSize="inherit">
                    {card?.nbOfComments}
                  </Typography>
                  <ForumOutlinedIcon fontSize="inherit" />
                </IconButton>
              )}
            </Box>
          </Box>
          {card && COMMENT_PANEL && isRefReady && (
            <CommentPanel cardId={card.id} anchorEl={commentDivRef.current} />
          )}
        </Box>
      </Box>
    </>
  );
};
