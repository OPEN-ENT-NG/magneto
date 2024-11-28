import { FC, useState, KeyboardEvent, memo, useCallback } from "react";

import { useUser } from "@edifice-ui/react";
import { mdiCommentOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { Avatar, Box, InputBase, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  avatarStyle,
  commentContentContainerStyle,
  commentCountContainerStyle,
  commentCountTypographyStyle,
  commentTextContainerStyle,
  commentTextStyle,
  containerStyle,
  inputBaseStyle,
  inputContainerStyle,
  timeStyle,
  userNameStyle,
} from "./style";
import { CardCommentProps } from "./types";
import { DND_ITEM_TYPE } from "~/hooks/dnd-hooks/types";
import useDirectory from "~/hooks/useDirectory";
import { useElapsedTime } from "~/hooks/useElapsedTime";
import { useAddCommentMutation } from "~/services/api/comment.service";

export const CardComment: FC<CardCommentProps> = memo(({ commentData }) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [addComment] = useAddCommentMutation();
  const { t } = useTranslation("magneto");
  const { avatar } = useUser();
  const { cardComment, nbOfComment, cardId } = commentData;
  const { getAvatarURL } = useDirectory();

  const time = useElapsedTime(cardComment?.modificationDate);

  const handleSubmit = useCallback(
    async (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && inputValue && cardId) {
        try {
          await addComment({
            cardId: cardId,
            content: inputValue,
          }).unwrap();
          setInputValue("");
        } catch (error) {
          console.error(error);
        }
      }
    },
    [addComment, cardId, inputValue],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    [],
  );

  const commentAvatar = cardComment
    ? getAvatarURL(cardComment.ownerId, "user")
    : "";

  return (
    <Box sx={containerStyle}>
      {cardComment && nbOfComment > 0 && (
        <>
          <Box sx={commentCountContainerStyle}>
            <Icon path={mdiCommentOutline} size={1} />
            <Typography sx={commentCountTypographyStyle}>
              {nbOfComment}
            </Typography>
          </Box>
          <Box sx={commentContentContainerStyle}>
            <Avatar sx={avatarStyle} src={commentAvatar} />
            <Box sx={commentTextContainerStyle}>
              <Typography sx={userNameStyle}>
                {cardComment.ownerName}
              </Typography>
              <Typography sx={timeStyle}>{time?.label}</Typography>
              <Typography sx={commentTextStyle}>
                {cardComment.content}
              </Typography>
            </Box>
          </Box>
        </>
      )}
      <Box sx={inputContainerStyle}>
        <Avatar sx={avatarStyle} src={avatar} />
        <InputBase
          data-type={DND_ITEM_TYPE.NON_DRAGGABLE}
          placeholder={t("magneto.add.comment")}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleSubmit}
          fullWidth
          sx={inputBaseStyle}
        />
      </Box>
    </Box>
  );
});

CardComment.displayName = "CardComment";
