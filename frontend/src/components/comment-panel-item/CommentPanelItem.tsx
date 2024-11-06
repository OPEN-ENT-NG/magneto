import { FC, useEffect, useRef, useState } from "react";

import { useOdeClient } from "@edifice-ui/react";
import { mdiArrowUpCircle } from "@mdi/js";
import Icon from "@mdi/react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  commentPanelItemWrapper,
  dateStyle,
  firstLineWrapper,
  greyDot,
  nameContentWrapper,
  nameStyle,
  relativeWrapper,
  rightContentWrapper,
  StyledCommentInput,
  updateIcon,
} from "./style";
import { CommentPanelItemProps } from "./types";
import { useCommentDropDownItems } from "./useCommentDropDownItems";
import { avatarStyle } from "../comment-panel/style";
import { DropDownList } from "../drop-down-list/DropDownList";
import { useDropdown } from "../drop-down-list/useDropDown";
import { iconButtonStyle, iconStyle } from "../section-name/style";
import useDirectory from "~/hooks/useDirectory";
import { useElapsedTime } from "~/hooks/useElapsedTime";
import { useUpdateCommentMutation } from "~/services/api/comment.service";


export const CommentPanelItem: FC<CommentPanelItemProps> = ({
  comment,
  cardId,
  isEditing,
  onStartEditing,
  onStopEditing,
}) => {
  const { getAvatarURL } = useDirectory();
  const { user } = useOdeClient();
  const { openDropdownId, registerDropdown, toggleDropdown, closeDropdown } =
    useDropdown();
  const { t } = useTranslation("magneto");
  const {
    _id: id,
    content,
    ownerId,
    ownerName,
    creationDate,
    modificationDate,
  } = comment;
  const [inputValue, setInputValue] = useState<string>(content);
  const [updateComment] = useUpdateCommentMutation();
  const dropDownItemList = useCommentDropDownItems(() => onStartEditing());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const time = useElapsedTime(modificationDate ?? creationDate).label;
  const isOpen = openDropdownId === id;

  const handleSubmit = async () => {
    if (!inputValue) {
      setInputValue(content);
      onStopEditing();
      return;
    }
    try {
      await updateComment({
        commentId: id,
        cardId: cardId,
        content: inputValue,
      }).unwrap();
      onStopEditing();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      registerDropdown(id, dropdownRef.current);
    }
  }, [id, registerDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditing &&
        inputWrapperRef.current &&
        !inputWrapperRef.current.contains(event.target as Node)
      ) {
        setInputValue(content);
        onStopEditing();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, inputValue, content, onStopEditing]);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(content);
    }
  }, [isEditing, content]);

  return (
    <Box sx={commentPanelItemWrapper}>
      <Avatar sx={avatarStyle} src={getAvatarURL(ownerId, "user")} />
      <Box sx={rightContentWrapper}>
        <Box sx={firstLineWrapper} ref={dropdownRef}>
          <Box sx={nameContentWrapper}>
            <Typography sx={nameStyle}>{ownerName}</Typography>
            <Box sx={greyDot} />
            <Typography sx={dateStyle}>{time}</Typography>
          </Box>
          {ownerId === user?.userId && (
            <IconButton
              size="large"
              sx={iconButtonStyle}
              onClick={() => toggleDropdown(id)}
            >
              <MoreHorizIcon sx={iconStyle} />
            </IconButton>
          )}
        </Box>
        <Box sx={relativeWrapper} ref={inputWrapperRef}>
          <StyledCommentInput
            fullWidth
            multiline
            maxRows={4}
            placeholder={`${t("magneto.add.comment")}...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            isEditing={isEditing}
            disabled={!isEditing}
          />
          {isEditing && !!inputValue && (
            <IconButton
              sx={updateIcon}
              onClick={handleSubmit}
              aria-label="submit"
              disabled={!inputValue}
            >
              <Icon path={mdiArrowUpCircle} size={2} />
            </IconButton>
          )}
        </Box>
      </Box>
      {isOpen && dropdownRef.current && (
        <DropDownList
          items={dropDownItemList}
          onClose={closeDropdown}
          open={isOpen}
          anchorEl={dropdownRef.current}
        />
      )}
    </Box>
  );
};
