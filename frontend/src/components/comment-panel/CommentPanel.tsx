import { FC, useState, KeyboardEvent, useEffect, useRef } from "react";

import { useUser } from "@edifice-ui/react";
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
  TextareaAutosize,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  avatarStyle,
  closeButtonStyle,
  commentPanelBody,
  commentPanelFooter,
  commentPanelheader,
  commentPanelTitle,
  commentPanelWrapper,
  dividerTextStyle,
  leftFooterContent,
  leftHeaderContent,
  SubmitIconButton,
  transparentBackDrop,
} from "./style";
import { CommentOrDivider, CommentPanelProps } from "./types";
import { processCommentsWithDividers, scrollToBottom } from "./utils";
import { CommentPanelItem } from "../comment-panel-item/CommentPanelItem";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { useBoard } from "~/providers/BoardProvider";
import {
  useAddCommentMutation,
  useGetAllCommentsQuery,
} from "~/services/api/comment.service";

export const CommentPanel: FC<CommentPanelProps> = ({ cardId }) => {
  const { t } = useTranslation("magneto");
  const { displayModals, toggleBoardModals } = useBoard();
  const { avatar } = useUser();
  const [addComment] = useAddCommentMutation();
  const { data: commentsData } = useGetAllCommentsQuery({ cardId });
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
    if (commentsData?.all.length) {
      setComsAndDividers(processCommentsWithDividers(commentsData.all));
    }
  }, [commentsData]);

  useEffect(() => {
    if (comsAndDividers.length > prevLengthRef.current) {
      scrollToBottom(commentBodyRef);
    }
    prevLengthRef.current = comsAndDividers.length;
  }, [comsAndDividers]);

  const handleSubmit = async () => {
    if (!inputValue) return;
    try {
      await addComment({
        cardId: cardId,
        content: inputValue,
      }).unwrap();
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

  return (
    <Modal
      open={displayModals.COMMENT_PANEL}
      onClose={() => {
        toggleBoardModals(BOARD_MODAL_TYPE.COMMENT_PANEL);
        setEditingCommentId(null);
      }}
      aria-labelledby="modal-title"
      aria-describedby="modal-section-deletion"
      slotProps={{
        backdrop: {
          sx: transparentBackDrop,
        },
      }}
    >
      <Box sx={commentPanelWrapper}>
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
        <Box sx={commentPanelBody}>
          {comsAndDividers.map((item, index) =>
            typeof item === "string" ? (
              <Divider key={item} sx={{ my: 2 }}>
                <Typography sx={dividerTextStyle}>{item}</Typography>
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
        <Box sx={commentPanelFooter}>
          <Box sx={leftFooterContent}>
            <Avatar sx={avatarStyle} src={avatar}></Avatar>
            <TextareaAutosize
              minRows={1}
              maxRows={4}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                resize: "none",
                padding: "8px 12px",
                fontFamily: "inherit",
                fontSize: "inherit",
                backgroundColor: "transparent",
              }}
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
        </Box>
      </Box>
    </Modal>
  );
};
