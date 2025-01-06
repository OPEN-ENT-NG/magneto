import { FC, useCallback, useEffect, useMemo, useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { Box, IconButton, Modal, Typography } from "@mui/material";

import {
  closeButtonStyle,
  commentButtonStyle,
  CommentContainer,
  StyledContentBox,
  modalBodyStyle,
  ModalWrapper,
} from "./style";
import { CommentPanel } from "../comment-panel/CommentPanel";
import { PreviewContent } from "../preview-content/PreviewContent";
import {
  blackColor,
  boxStyle,
  leftNavigationStyle,
  rightNavigationStyle,
} from "../read-view/style";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { useWindowResize } from "~/hooks/useWindowResize";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";

export const PreviewModal: FC = () => {
  const {
    board,
    closeActiveCardAction,
    displayModals: { CARD_PREVIEW, COMMENT_PANEL },
    activeCard,
    board: { canComment },
    toggleBoardModals,
    setActiveCard,
  } = useBoard();
  const [isRefReady, setIsRefReady] = useState(false);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const commentDivRef = useWindowResize();

  useEffect(() => {
    if (COMMENT_PANEL && commentDivRef.current) {
      setIsRefReady(true);
    } else {
      setIsRefReady(false);
    }
  }, [COMMENT_PANEL]);

  const initialCards = useMemo(() => {
    return board.isLayoutFree()
      ? board.cards
      : board.sections.flatMap((section) => section.cards || []);
  }, [board]);

  useEffect(() => {
    setCardIndex(
      initialCards.findIndex(
        (selectedCard: Card) => selectedCard.id === activeCard?.id,
      ),
    );
  }, [activeCard]);

  const navigatePage = (direction: "next" | "prev") => {
    const newIndex = direction === "next" ? cardIndex + 1 : cardIndex - 1;
    const newCard = initialCards[newIndex];
    setActiveCard(newCard);
  };

  const isLastCardInBoard = (): boolean => {
    const cards = board.isLayoutFree() ? board.cards : initialCards;
    return activeCard === cards[cards.length - 1];
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

  return (
    <Modal
      open={CARD_PREVIEW}
      onClose={() => closeActiveCardAction(BOARD_MODAL_TYPE.CARD_PREVIEW)}
      aria-labelledby="modal-card-preview"
      aria-describedby="modal-card-preview"
    >
      <ModalWrapper ref={commentDivRef} isCommentOpen={COMMENT_PANEL}>
        <Box sx={modalBodyStyle}>
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
          <IconButton
            onClick={() => closeActiveCardAction(BOARD_MODAL_TYPE.CARD_PREVIEW)}
            aria-label="close"
            sx={closeButtonStyle}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
          <StyledContentBox
            isCommentOpen={COMMENT_PANEL}
            data-scrollable="true"
          >
            {activeCard && <PreviewContent card={activeCard} />}
          </StyledContentBox>
          <CommentContainer isVisible={COMMENT_PANEL} />
          {canComment && !COMMENT_PANEL && (
            <IconButton
              onClick={() => toggleBoardModals(BOARD_MODAL_TYPE.COMMENT_PANEL)}
              aria-label="close"
              sx={commentButtonStyle}
            >
              <Typography fontSize="inherit">
                {activeCard?.nbOfComments}
              </Typography>
              <ForumOutlinedIcon fontSize="inherit" />
            </IconButton>
          )}
        </Box>
        {activeCard && COMMENT_PANEL && isRefReady && (
          <CommentPanel
            cardId={activeCard.id}
            anchorEl={commentDivRef.current}
            isInCardPreview
          />
        )}
      </ModalWrapper>
    </Modal>
  );
};
