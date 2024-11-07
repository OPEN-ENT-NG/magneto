import { FC, useState, KeyboardEvent, useEffect } from "react";

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
  dividerTextStyle,
  footerInputStyle,
  leftFooterContent,
  leftHeaderContent,
  SubmitIconButton,
  transparentBackDrop,
} from "./style";
import { CommentOrDivider, CommentPanelProps } from "./types";
import { processCommentsWithDividers } from "./utils";
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
  const [comsAndDividers, setComsAndDividers] = useState<CommentOrDivider[]>(
    [],
  );
  useEffect(() => {
    if (commentsData?.all.length)
      setComsAndDividers(processCommentsWithDividers(commentsData.all));
  }, [commentsData]);

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
  console.log(comsAndDividers);

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
          {comsAndDividers.map((item) =>
            typeof item === "string" ? (
              <Divider key={item} sx={{ my: 2 }}>
                <Typography sx={dividerTextStyle}>{item}</Typography>
              </Divider>
            ) : (
              <CommentPanelItem
                comment={item}
                key={item._id}
                cardId={cardId}
                isEditing={editingCommentId === item._id}
                onStartEditing={() => setEditingCommentId(item._id)}
                onStopEditing={() => setEditingCommentId(null)}
              />
            ),
          )}
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
