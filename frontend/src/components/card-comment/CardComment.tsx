import { FC, useState, KeyboardEvent, useEffect } from "react";

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
import { getAvatarUrl } from "./utils";
import { useElapsedTime } from "~/hooks/useElapsedTime";
import { useAddCommentMutation } from "~/services/api/comment.service";
import useDirectory from "~/hooks/useDirectory";

export const CardComment: FC<CardCommentProps> = ({ commentData }) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [ownerAvatar, setOwnerAvatar] = useState<string>("");
  const [addComment] = useAddCommentMutation();
  const { t } = useTranslation("magneto");
  const { avatar } = useUser();
  const { cardComment, nbOfComment, cardId } = commentData;

  const time = useElapsedTime(cardComment.modificationDate);
  const { getAvatarURL } = useDirectory();

  const getOwnerAvatar = async (ownerId: string) => {
    const avatar = await getAvatarUrl(ownerId);
    if (avatar) return setOwnerAvatar(avatar);
  };

  useEffect(() => {
    if (cardComment.ownerId) getOwnerAvatar(cardComment.ownerId);
  }, [cardComment.ownerId]);

  const handleSubmit = async (event: KeyboardEvent<HTMLInputElement>) => {
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
  };

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
            <Avatar
              sx={avatarStyle}
              src={getAvatarURL(cardComment.ownerId, "user")}
            ></Avatar>
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
        <Avatar sx={avatarStyle} src={avatar}></Avatar>
        <InputBase
          placeholder={t("magneto.add.comment")}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleSubmit}
          fullWidth
          sx={inputBaseStyle}
        />
      </Box>
    </Box>
  );
};
