import { FC, useEffect, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { Box, IconButton, Modal, Typography } from "@mui/material";

import {
  closeButtonStyle,
  commentButtonStyle,
  CommentContainer,
  contentWrapper,
  modalBodyStyle,
  ModalWrapper,
} from "./style";
import { CommentPanel } from "../comment-panel/CommentPanel";
import { PreviewContent } from "../preview-content/PreviewContent";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { useWindowResize } from "~/hooks/useWindowResize";
import { useBoard } from "~/providers/BoardProvider";

export const PreviewModal: FC = () => {
  const {
    closeActiveCardAction,
    displayModals: { CARD_PREVIEW, COMMENT_PANEL },
    activeCard,
    board: { canComment },
    toggleBoardModals,
  } = useBoard();
  const [isRefReady, setIsRefReady] = useState(false);
  const commentDivRef = useWindowResize();

  useEffect(() => {
    if (COMMENT_PANEL && commentDivRef.current) {
      setIsRefReady(true);
    } else {
      setIsRefReady(false);
    }
  }, [COMMENT_PANEL]);

  return (
    <Modal
      open={CARD_PREVIEW}
      onClose={() => closeActiveCardAction(BOARD_MODAL_TYPE.CARD_PREVIEW)}
      aria-labelledby="modal-card-preview"
      aria-describedby="modal-card-preview"
    >
      <ModalWrapper isCommentOpen={COMMENT_PANEL} ref={commentDivRef}>
        <Box sx={modalBodyStyle}>
          <IconButton
            onClick={() => closeActiveCardAction(BOARD_MODAL_TYPE.CARD_PREVIEW)}
            aria-label="close"
            sx={closeButtonStyle}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
          <Box sx={contentWrapper} data-scrollable="true">
            {activeCard && <PreviewContent card={activeCard} />}
          </Box>
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
