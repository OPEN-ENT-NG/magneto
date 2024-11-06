import { FC, useState, KeyboardEvent } from "react";
import { useUser } from "@edifice-ui/react";
import { mdiArrowUpCircle } from "@mdi/js";
import Icon from "@mdi/react";
import CloseIcon from "@mui/icons-material/Close";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import {
  Avatar,
  Box,
  IconButton,
  InputBase,
  Modal,
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
  footerInputStyle,
  leftFooterContent,
  leftHeaderContent,
  SubmitIconButton,
  transparentBackDrop,
} from "./style";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { useBoard } from "~/providers/BoardProvider";
import { CommentPanelProps } from "./types";
import {
  useAddCommentMutation,
  useGetAllCommentsQuery,
} from "~/services/api/comment.service";
import { CommentPanelItem } from "../comment-panel-item/CommentPanelItem";

export const CommentPanel: FC<CommentPanelProps> = ({ cardId }) => {
  const { t } = useTranslation("magneto");
  const { displayModals, toggleBoardModals } = useBoard();
  const { avatar } = useUser();
  const [addComment] = useAddCommentMutation();
  const { data: commentsData } = useGetAllCommentsQuery({ cardId });
  const [inputValue, setInputValue] = useState<string>("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

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
    if (e.key === "Enter" && !!inputValue) return handleSubmit();
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
          {commentsData &&
            commentsData.all.map((item) => (
              <CommentPanelItem
                comment={item}
                key={item._id}
                cardId={cardId}
                isEditing={editingCommentId === item._id}
                onStartEditing={() => setEditingCommentId(item._id)}
                onStopEditing={() => setEditingCommentId(null)}
              />
            ))}
        </Box>
        <Box sx={commentPanelFooter}>
          <Box sx={leftFooterContent}>
            <Avatar sx={avatarStyle} src={avatar}></Avatar>
            <InputBase
              sx={footerInputStyle}
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
