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
  modalWrapperStyle,
} from "./style";
import { CommentPanel } from "../comment-panel/CommentPanel";
import { PreviewContent } from "../preview-content/PreviewContent";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { useWindowResize } from "~/hooks/useWindowResize";
import { useBoard } from "~/providers/BoardProvider";

export const PreviewModal: FC = () => {
  const {
    closeCardPreview,
    displayModals: { CARD_PREVIEW, COMMENT_PANEL },
    cardInPreview,
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
      onClose={() => closeCardPreview()}
      aria-labelledby="modal-card-preview"
      aria-describedby="modal-card-preview"
    >
      <Box sx={modalWrapperStyle} ref={commentDivRef}>
        <Box sx={modalBodyStyle}>
          <IconButton
            onClick={() => closeCardPreview()}
            aria-label="close"
            sx={closeButtonStyle}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
          <Box sx={contentWrapper} data-scrollable="true">
            {cardInPreview && <PreviewContent card={cardInPreview} />}
          </Box>
          <CommentContainer isVisible={COMMENT_PANEL} />
          {canComment && !COMMENT_PANEL && (
            <IconButton
              onClick={() => toggleBoardModals(BOARD_MODAL_TYPE.COMMENT_PANEL)}
              aria-label="close"
              sx={commentButtonStyle}
            >
              <Typography fontSize="inherit">
                {cardInPreview?.nbOfComments}
              </Typography>
              <ForumOutlinedIcon fontSize="inherit" />
            </IconButton>
          )}
        </Box>
        {cardInPreview && COMMENT_PANEL && isRefReady && (
          <CommentPanel
            cardId={cardInPreview.id}
            anchorEl={commentDivRef.current}
            isInCardPreview
          />
        )}
      </Box>
    </Modal>
  );
};
