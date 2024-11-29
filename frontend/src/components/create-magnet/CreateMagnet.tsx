/* eslint-disable jsx-a11y/media-has-caption */
import { FC, useEffect, useRef, useState } from "react";

import { Editor, EditorRef } from "@edifice-ui/editor";
import { Edit } from "@edifice-ui/icons";
import {
  IconButton as EdIconButton,
  Button,
  FormControl,
  Input,
  Label,
  MediaLibrary,
  useOdeClient,
  MediaLibraryType,
} from "@edifice-ui/react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  Typography,
  FormControl as FormControlMUI,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import {
  modalContainerStyle,
  headerStyle,
  titleStyle,
  closeButtonStyle,
  contentContainerStyle,
  editorStyle,
  modalFooterStyle,
  formControlStyle,
  formControlMUIStyle,
  inputLabelStyle,
  selectStyle,
  mediaLibraryStyle,
  footerButtonStyle,
  menuItemStyle,
  formControlEditorStyle,
  audioWrapperStyle,
} from "./style";
import { CardPayload } from "./types";
import {
  convertMediaTypeToResourceType,
  convertResourceTypeToMediaType,
} from "./utils";
import { MediaProps } from "../board-view/types";
import { FilePickerWorkspace } from "../file-picker-workspace/FilePickerWorkspace";
import { iconButtonStyle } from "../file-picker-workspace/style";
import { ImageContainer } from "../image-container/ImageContainer";
import { VideoPlayer } from "../video-player/VideoPlayer";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { MEDIA_LIBRARY_TYPE } from "~/core/enums/media-library-type.enum";
import { MENU_NOT_MEDIA_TYPE } from "~/core/enums/menu-not-media-type.enum";
import { RESOURCE_TYPE } from "~/core/enums/resource-type.enum";
import { useBoard } from "~/providers/BoardProvider";
import { Section } from "~/providers/BoardProvider/types";
import { useMediaLibrary } from "~/providers/MediaLibraryProvider";
import {
  useCreateCardMutation,
  useUpdateCardMutation,
} from "~/services/api/cards.service";
import { workspaceApi } from "~/services/api/workspace.service";

export const CreateMagnet: FC = () => {
  const { appCode } = useOdeClient();
  const { t } = useTranslation("magneto");
  const { board, documents } = useBoard();
  const dispatchRTK = useDispatch();

  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [section, setSection] = useState<Section | null>(
    board.sections[0] ?? null,
  );
  const [description, setDescription] = useState<string>("");
  const editorRef = useRef<EditorRef>(null);

  const [createCard] = useCreateCardMutation();
  const [updateCard] = useUpdateCardMutation();

  const {
    mediaLibraryRef,
    mediaLibraryHandlers,
    media,
    setMedia,
    isCreateMagnetOpen,
    onClose,
    magnetType,
    setMagnetType,
    handleClickMedia,
  } = useMediaLibrary();
  const { activeCard, closeActiveCardAction } = useBoard();
  const isEditMagnet = !!activeCard;

  const firstInputRef = useRef<HTMLInputElement>(null);

  const handleSectionChange = (event: SelectChangeEvent<string>) => {
    const sectionTitle = event.target.value;
    const selectedSection = board.sections.find(
      (sectionSelected: Section) => sectionSelected.title === sectionTitle,
    );
    if (selectedSection) {
      setSection(selectedSection);
    }
  };

  const onCloseModalAndDeactivateCard = () => {
    closeActiveCardAction(BOARD_MODAL_TYPE.CREATE_EDIT);
    onCloseModal();
  };

  const onCloseModal = () => {
    setTitle("");
    setCaption("");
    setLinkUrl("");
    setDescription("");
    if (section !== null) setSection(board.sections[0]);
    onClose();
  };

  const modifyFile = (type: MediaLibraryType) => {
    handleClickMedia(type);
  };

  const onUpload = async () => {
    const payload: CardPayload = {
      boardId: board._id,
      caption: caption,
      description: editorRef.current?.getContent("html") as string,
      locked: isEditMagnet ? activeCard.locked : false,
      resourceId: media?.id ?? "",
      resourceType: getMagnetResourceType(),
      resourceUrl: linkUrl ? linkUrl : media?.url ?? null,
      title: title,
      id: isEditMagnet ? activeCard.id : undefined,
      ...(section?._id ? { sectionId: section._id } : {}),
    };
    isEditMagnet ? await updateCard(payload) : await createCard(payload);
    if (
      payload.resourceType === RESOURCE_TYPE.FILE &&
      documents.find((doc) => doc._id === payload.resourceId) === undefined
    ) {
      dispatchRTK(workspaceApi.util.invalidateTags(["Documents"]));
    }
    onCloseModalAndDeactivateCard();
  };

  const getMagnetResourceType = (): string => {
    if (isEditMagnet) {
      return magnetType ?? activeCard.resourceType;
    } else {
      return magnetType ?? convertMediaTypeToResourceType(media?.type);
    }
  };

  useEffect(() => {
    if (!isEditMagnet && media?.name) {
      if (magnetTypeHasAudio) return setTitle(media.name.split(".")[0]);
      if (magnetTypeHasLink) {
        setLinkUrl(media.url); // init if type link only
        setTitle(media.name.replace(/^(?:https?:\/\/(?:www\.)?|www\.)/, ""));
      } else if (!magnetTypeHasVideo)
        setTitle(media.name.split(".").slice(0, -1).join("."));
    }
  }, [media]);

  useEffect(() => {
    if (isEditMagnet) {
      setTitle(activeCard.title);
      setCaption(activeCard.caption);
      // init if type link only
      if (activeCard.resourceType === RESOURCE_TYPE.LINK)
        setLinkUrl(activeCard.resourceUrl);
      setDescription(activeCard.description);

      if (activeCard.resourceType === MENU_NOT_MEDIA_TYPE.TEXT)
        setMagnetType(MENU_NOT_MEDIA_TYPE.TEXT);

      setMedia({
        name: activeCard.metadata?.name,
        url: activeCard.resourceUrl,
        id: activeCard.resourceId,
        type: convertResourceTypeToMediaType(activeCard.resourceType),
      } as MediaProps);
    }
  }, [activeCard]);

  const magnetTypeHasFilePickerWorkspace =
    media && media.type === MEDIA_LIBRARY_TYPE.ATTACHMENT;

  const magnetTypeHasImage =
    media && media.url && media.type === MEDIA_LIBRARY_TYPE.IMAGE;
  const magnetTypeHasAudio =
    media && media.url && media.type === MEDIA_LIBRARY_TYPE.AUDIO;
  const magnetTypeHasLink =
    media && media.url && media.type === MEDIA_LIBRARY_TYPE.HYPERLINK;
  const magnetTypeHasVideo =
    media && media.url && media.type === MEDIA_LIBRARY_TYPE.VIDEO;
  const magnetTypeHasCaption = magnetType !== "text";

  useEffect(() => {
    if (isCreateMagnetOpen) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isCreateMagnetOpen]);

  useEffect(() => {
    if (board.sections) {
      setSection(board.sections[0]);
    }
  }, [board.sections]);

  return (
    <>
      <Modal
        open={isCreateMagnetOpen}
        onClose={() => onCloseModalAndDeactivateCard()}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        style={{ zIndex: 1000 }}
      >
        <Box sx={modalContainerStyle}>
          <Box sx={headerStyle}>
            <Typography
              id="modal-title"
              variant="h4"
              component="h2"
              sx={titleStyle}
            >
              {isEditMagnet ? t("magneto.edit.card") : t("magneto.new.card")}
            </Typography>
            <IconButton
              onClick={() => onCloseModalAndDeactivateCard()}
              aria-label="close"
              sx={closeButtonStyle}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Box>
          <Box sx={contentContainerStyle}>
            {magnetTypeHasFilePickerWorkspace && (
              <FilePickerWorkspace
                modifyFile={modifyFile}
                addButtonLabel={"Change file"}
              />
            )}
            {magnetTypeHasImage && (
              <ImageContainer media={media} handleClickMedia={modifyFile} />
            )}
            {magnetTypeHasAudio && (
              <Box sx={audioWrapperStyle}>
                <audio controls preload="metadata" src={media.url}>
                  <source src={media.url} type={media.type} />
                </audio>
                {!isEditMagnet && (
                  <EdIconButton
                    aria-label="Edit audio"
                    color="tertiary"
                    icon={<Edit />}
                    onClick={() => modifyFile(MEDIA_LIBRARY_TYPE.AUDIO)}
                    type="button"
                    variant="ghost"
                    style={iconButtonStyle}
                  />
                )}
              </Box>
            )}
            {magnetTypeHasVideo && <VideoPlayer modifyFile={modifyFile} />}{" "}
            {magnetTypeHasLink && (
              <FormControl id="url" style={formControlStyle}>
                <Label>{t("magneto.site.address")}</Label>
                <Input
                  ref={firstInputRef}
                  value={linkUrl}
                  size="md"
                  type="text"
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </FormControl>
            )}
            <FormControl id="title" style={formControlStyle}>
              <Label>{t("magneto.card.title")}</Label>
              <Input
                ref={magnetTypeHasLink ? null : firstInputRef}
                value={title}
                placeholder={t("magneto.card.title")}
                size="md"
                type="text"
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormControl>
            {magnetTypeHasCaption && (
              <FormControl id="caption" style={formControlStyle}>
                <Label>{t("magneto.card.caption")}</Label>
                <Input
                  value={caption}
                  placeholder={t("magneto.card.caption")}
                  size="md"
                  type="text"
                  onChange={(e) => setCaption(e.target.value)}
                />
              </FormControl>
            )}
            <FormControl id="description" style={formControlEditorStyle}>
              <Label>{t("magneto.create.board.description")}</Label>
              <Box sx={editorStyle}>
                <Editor
                  id="postContent"
                  content={description}
                  mode="edit"
                  ref={editorRef}
                />
              </Box>
            </FormControl>
            {section && (
              <FormControlMUI variant="outlined" sx={formControlMUIStyle}>
                <InputLabel
                  id="input-section"
                  shrink={true}
                  sx={inputLabelStyle}
                >
                  {t("magneto.card.section")}
                </InputLabel>
                <Select
                  labelId="select-section"
                  id="select-section"
                  value={section.title}
                  onChange={handleSectionChange}
                  label={t("magneto.card.section")}
                  notched
                  size="medium"
                  sx={selectStyle}
                >
                  {board.sections.map((s: Section) => (
                    <MenuItem key={s.title} value={s.title}>
                      <Box sx={menuItemStyle}>{s.title}</Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControlMUI>
            )}
            <Box sx={modalFooterStyle}>
              <Button
                style={footerButtonStyle}
                color="tertiary"
                type="button"
                variant="ghost"
                onClick={() => onCloseModalAndDeactivateCard()}
              >
                {t("magneto.cancel")}
              </Button>
              <Button
                style={footerButtonStyle}
                color="primary"
                type="submit"
                variant="filled"
                onClick={() => onUpload()}
              >
                {t("magneto.save")}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      <Box sx={mediaLibraryStyle}>
        <MediaLibrary
          appCode={appCode}
          ref={mediaLibraryRef}
          multiple={false}
          visibility="protected"
          {...mediaLibraryHandlers}
        />
      </Box>
    </>
  );
};
