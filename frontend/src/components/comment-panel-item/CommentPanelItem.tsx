import {
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
  memo,
} from "react";

import { useOdeClient, useToast } from "@edifice-ui/react";
import { mdiArrowUpCircle } from "@mdi/js";
import Icon from "@mdi/react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  CommentPanelItemWrapper,
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
import DeleteConfirmationModal from "../comment-confirmation-modal/CommentConfirmationModal";
import { avatarStyle } from "../comment-panel/style";
import { DropDownList } from "../drop-down-list/DropDownList";
import { useDropdown } from "../drop-down-list/useDropDown";
import { iconButtonStyle, iconStyle } from "../section-name/style";
import useDirectory from "~/hooks/useDirectory";
import { useElapsedTime } from "~/hooks/useElapsedTime";
import {
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} from "~/services/api/comment.service";

const CommentPanelItemBase = memo(
  (props: CommentPanelItemProps) => {
    const {
      isLast = false,
      comment,
      cardId,
      isEditing,
      isDeleting,
      onStartEditing,
      onStartDeleting,
      onStopEditing,
    } = props;

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
    const [deleteComment] = useDeleteCommentMutation();

    const handleStartEditing = useCallback(() => {
      onStartEditing();
    }, [onStartEditing]);

    const handleStartDeleting = useCallback(() => {
      onStartDeleting();
    }, [onStartDeleting]);

    const dropDownItemList = useCommentDropDownItems(
      handleStartEditing,
      handleStartDeleting,
    );

    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputWrapperRef = useRef<HTMLDivElement>(null);
    const commentWrapperRef = useRef<HTMLDivElement>(null);
    const time = useElapsedTime(modificationDate ?? creationDate).label;
    const isOpen = openDropdownId === id;
    const toast = useToast();

    const handleSubmit = useCallback(async () => {
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
    }, [inputValue, content, onStopEditing, updateComment, id, cardId]);

    const handleDelete = useCallback(async () => {
      try {
        await deleteComment({
          commentId: id,
          cardId: cardId,
        }).unwrap();
        toast.success(t("magneto.delete.comment.success"));
        onStopEditing();
      } catch (error) {
        console.error(error);
      }
    }, [deleteComment, id, cardId, onStopEditing, t, toast]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (inputValue) {
            handleSubmit();
          }
        }
      },
      [inputValue, handleSubmit],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
      },
      [],
    );

    const handleToggleDropdown = useCallback(() => {
      toggleDropdown(id);
    }, [toggleDropdown, id]);

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
    }, [isEditing, content, onStopEditing]);

    useEffect(() => {
      if (!isEditing) {
        setInputValue(content);
      }
    }, [isEditing, content]);

    return (
      <CommentPanelItemWrapper ref={commentWrapperRef} isLast={isLast}>
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
                onClick={handleToggleDropdown}
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
              onChange={handleChange}
              isEditing={isEditing}
              InputProps={{
                readOnly: !isEditing,
              }}
              onKeyDown={handleKeyDown}
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
        {isDeleting && (
          <DeleteConfirmationModal
            open={isDeleting}
            onClose={onStopEditing}
            onConfirm={handleDelete}
            anchorEl={commentWrapperRef.current}
          />
        )}
      </CommentPanelItemWrapper>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isEditing === nextProps.isEditing &&
      prevProps.isDeleting === nextProps.isDeleting &&
      prevProps.isLast === nextProps.isLast &&
      prevProps.comment === nextProps.comment
    );
  },
);

export const CommentPanelItem = memo(
  CommentPanelItemBase,
  (prevProps, nextProps) => {
    return (
      prevProps.isEditing === nextProps.isEditing &&
      prevProps.isDeleting === nextProps.isDeleting &&
      prevProps.isLast === nextProps.isLast &&
      prevProps.comment === nextProps.comment
    );
  },
);

CommentPanelItem.displayName = "CommentPanelItem";
