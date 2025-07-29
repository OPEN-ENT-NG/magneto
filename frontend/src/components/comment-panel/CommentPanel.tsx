import { FC, useState, KeyboardEvent, useEffect, useRef } from "react";

import { useUser } from "@edifice.io/react";
import { mdiArrowUpCircle } from "@mdi/js";
import Icon from "@mdi/react";
import CloseIcon from "@mui/icons-material/Close";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  avatarStyle,
  closeButtonStyle,
  commentPanelBody,
  CommentPanelFooter,
  commentPanelheader,
  commentPanelTitle,
  CommentPanelWrapper,
  dividerTextStyle,
  leftFooterContent,
  leftHeaderContent,
  StyledTextarea,
  SubmitIconButton,
  transparentBackDrop,
} from "./style";
import { CommentOrDivider, CommentPanelProps } from "./types";
import {
  getModalPosition,
  processCommentsWithDividers,
  scrollToBottom,
} from "./utils";
import { CommentPanelItem } from "../comment-panel-item/CommentPanelItem";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { useBoard } from "~/providers/BoardProvider";
import { useWebSocketMagneto } from "~/providers/WebsocketProvider";
import {
  useAddCommentMutation,
  useGetAllCommentsQuery,
} from "~/services/api/comment.service";

export const CommentPanel: FC<CommentPanelProps> = ({
  isInCardPreview = false,
  cardId,
  anchorEl,
  anchorOrigin = { vertical: "bottom", horizontal: "right" },
  transformOrigin = { vertical: "bottom", horizontal: "right" },
  comments = [],
}) => {
  const { t } = useTranslation("magneto");
  const { displayModals, toggleBoardModals, isExternalView } = useBoard();
  const { avatar } = useUser();
  const [addComment] = useAddCommentMutation();

  const { sendMessage, readyState } = useWebSocketMagneto();
  const { data: commentsData } = useGetAllCommentsQuery(
    { cardId },
    { skip: !!comments.length },
  );
  const [inputValue, setInputValue] = useState<string>("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );
  const [comsAndDividers, setComsAndDividers] = useState<CommentOrDivider[]>(
    [],
  );
  const commentBodyRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const mainScrollable = document.querySelector('[data-scrollable="true"]');
      const commentBody = document.querySelector('[data-comment-body="true"]');
      if (commentBody?.contains(e.target as Node)) {
        return;
      }
      if (mainScrollable) {
        e.preventDefault();
        mainScrollable.scrollTop += e.deltaY;
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    const commentsToUse = comments?.length ? comments : commentsData?.all;

    if (commentsToUse?.length) {
      return setComsAndDividers(processCommentsWithDividers(commentsToUse));
    }
    return setComsAndDividers([]);
  }, [commentsData, comments]);

  useEffect(() => {
    if (comsAndDividers.length > prevLengthRef.current) {
      scrollToBottom(commentBodyRef);
    }
    prevLengthRef.current = comsAndDividers.length;
  }, [comsAndDividers]);

  const handleSubmit = async () => {
    if (!inputValue) return;
    try {
      if (readyState === WebSocket.OPEN) {
        sendMessage(
          JSON.stringify({
            type: "commentAdded",
            comment: {
              content: inputValue,
            },
            cardId: cardId,
          }),
        );
      } else {
        await addComment({
          cardId: cardId,
          content: inputValue,
        }).unwrap();
      }
      setInputValue("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue) {
        handleSubmit();
      }
    }
  };
  if (!anchorEl) return;

  const modalPosition = getModalPosition(
    anchorEl,
    anchorOrigin,
    transformOrigin,
  );

  const handleClose = () => {
    toggleBoardModals(BOARD_MODAL_TYPE.COMMENT_PANEL);
    setEditingCommentId(null);
  };

  return (
    <Modal
      open={displayModals.COMMENT_PANEL}
      disableScrollLock
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-section-deletion"
      slotProps={{
        backdrop: {
          sx: transparentBackDrop,
        },
      }}
    >
      <CommentPanelWrapper isInCardPreview={isInCardPreview} sx={modalPosition}>
        <Box sx={commentPanelheader}>
          <Box sx={leftHeaderContent}>
            <ForumOutlinedIcon sx={commentPanelTitle} />
            <Typography sx={commentPanelTitle}>
              {t("magneto.comments")}
            </Typography>
          </Box>
          <IconButton
            onClick={() => toggleBoardModals(BOARD_MODAL_TYPE.COMMENT_PANEL)}
            aria-label="close"
            sx={closeButtonStyle}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
        <Box
          sx={commentPanelBody}
          ref={commentBodyRef}
          data-comment-body="true"
        >
          {comsAndDividers.map((item, index) =>
            typeof item === "string" ? (
              <Divider key={item} sx={{ my: 2 }}>
                <Typography sx={dividerTextStyle}>
                  {item === "magneto.yesterday" || item === "magneto.today"
                    ? t(item)
                    : item}
                </Typography>
              </Divider>
            ) : (
              <CommentPanelItem
                isLast={comsAndDividers.lastIndexOf(item) === index}
                comment={item}
                key={item._id}
                cardId={cardId}
                isEditing={editingCommentId === item._id}
                isDeleting={deletingCommentId === item._id}
                onStartEditing={() => {
                  setEditingCommentId(item._id);
                }}
                onStartDeleting={() => {
                  setDeletingCommentId(item._id);
                }}
                onStopEditing={() => {
                  setEditingCommentId(null);
                  setDeletingCommentId(null);
                }}
              />
            ),
          )}
        </Box>
        {!isExternalView && (
          <CommentPanelFooter isInCardPreview={isInCardPreview}>
            <Box sx={leftFooterContent}>
              <Avatar sx={avatarStyle} src={avatar}></Avatar>
              <StyledTextarea
                minRows={1}
                maxRows={4}
                placeholder={`${t("magneto.add.comment")}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </Box>
            <SubmitIconButton
              onClick={handleSubmit}
              aria-label="submit"
              isEnabled={!!inputValue}
              disabled={!inputValue}
            >
              <Icon path={mdiArrowUpCircle} size={2} />
            </SubmitIconButton>
          </CommentPanelFooter>
        )}
      </CommentPanelWrapper>
    </Modal>
  );
};
