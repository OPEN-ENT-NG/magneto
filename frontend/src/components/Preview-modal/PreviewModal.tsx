import { FC, useCallback, useEffect, useMemo, useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { Box, IconButton, Modal, Typography } from "@mui/material";
import debounce from "lodash/debounce";

import {
  closeButtonStyle,
  commentButtonStyle,
  CommentContainer,
  StyledContentBox,
  modalBodyStyle,
  ModalWrapper,
  leftNavigationStyle,
  rightNavigationStyle,
} from "./style";
import { CommentPanel } from "../comment-panel/CommentPanel";
import { PreviewContent } from "../preview-content/PreviewContent";
import { blackColor } from "../read-view/style";
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
  const [localCardIndex, setLocalCardIndex] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState(false);
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
    if (!isNavigating) {
      const newIndex = initialCards.findIndex(
        (selectedCard: Card) => selectedCard.id === activeCard?.id,
      );
      setLocalCardIndex(newIndex);
    }
  }, [activeCard, initialCards, isNavigating]);

  const debouncedNavigation = useCallback(
    debounce((card: Card) => {
      setActiveCard(card);
      setIsNavigating(false);
    }, 200),
    [setActiveCard],
  );

  const navigatePage = useCallback(
    (direction: "next" | "prev") => {
      setIsNavigating(true);
      const newIndex =
        direction === "next" ? localCardIndex + 1 : localCardIndex - 1;
      setLocalCardIndex(newIndex);
      const newCard = initialCards[newIndex];
      debouncedNavigation(newCard);
    },
    [localCardIndex, initialCards, debouncedNavigation],
  );

  const isLastCardInBoard = useCallback((): boolean => {
    return localCardIndex === initialCards.length - 1;
  }, [localCardIndex, initialCards]);

  const handleKeyNavigation = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && localCardIndex > 0 && !isNavigating) {
        navigatePage("prev");
      } else if (
        event.key === "ArrowRight" &&
        !isLastCardInBoard() &&
        !isNavigating
      ) {
        navigatePage("next");
      }
    },
    [localCardIndex, isLastCardInBoard, navigatePage, isNavigating],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyNavigation);

    return () => {
      window.removeEventListener("keydown", handleKeyNavigation);
    };
  }, [handleKeyNavigation]);

  return (
    <Box sx={{ position: "relative" }}>
      <Modal
        open={CARD_PREVIEW}
        onClose={() => closeActiveCardAction(BOARD_MODAL_TYPE.CARD_PREVIEW)}
        aria-labelledby="modal-card-preview"
        aria-describedby="modal-card-preview"
      >
        <ModalWrapper ref={commentDivRef} isCommentOpen={COMMENT_PANEL}>
          <Box sx={modalBodyStyle}>
            <IconButton
              onClick={() =>
                closeActiveCardAction(BOARD_MODAL_TYPE.CARD_PREVIEW)
              }
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
                onClick={() =>
                  toggleBoardModals(BOARD_MODAL_TYPE.COMMENT_PANEL)
                }
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

      {CARD_PREVIEW && (
        <>
          {localCardIndex > 0 && (
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
        </>
      )}
    </Box>
  );
};
