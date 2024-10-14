import { FC, useEffect, useRef, useState } from "react";

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
} from "./style";
import { useMediaLibrary } from "~/providers/MediaLibraryProvider";
import {
  Button,
  FormControl,
  Input,
  Label,
  MediaLibrary,
  useOdeClient,
} from "@edifice-ui/react";
import { Editor, EditorRef } from "@edifice-ui/editor";
import { useTranslation } from "react-i18next";
import { Section } from "~/providers/BoardProvider/types";
import { useBoard } from "~/providers/BoardProvider";
import { FilePickerWorkspace } from "../file-picker-workspace/FilePickerWorkspace";
import { CardPayload } from "./types";
import { useCreateCardMutation } from "~/services/api/cards.service";

export const CreateMagnet: FC = () => {
  const { appCode } = useOdeClient();
  const { t } = useTranslation("magneto");
  const { board } = useBoard();

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [section, setSection] = useState<Section>(board.sections[0]);
  const [description] = useState<string>("");
  const editorRef = useRef<EditorRef>(null);

  const [createCard] = useCreateCardMutation();

  const {
    mediaLibraryRef,
    mediaLibraryHandlers,
    media,
    isCreateMagnetOpen,
    onClose,
    magnetType,
  } = useMediaLibrary();

  const handleSectionChange = (event: SelectChangeEvent<string>) => {
    const sectionTitle = event.target.value;
    const selectedSection = board.sections.find(
      (s) => s.title === sectionTitle,
    );
    if (selectedSection) {
      setSection(selectedSection);
    }
  };

  const onCloseModal = () => {
    setTitle("");
    setCaption("");
    setSection(board.sections[0]);
    onClose();
  };

  const onUpload = async () => {
    const payload: CardPayload = {
      boardId: board._id,
      caption: caption,
      description: editorRef.current?.getContent("html") as string,
      locked: false,
      resourceId: media?.id || "",
      resourceType: magnetType || media?.type || "",
      resourceUrl: media?.url || null,
      sectionId: section._id,
      title: title,
    };
    await createCard(payload);
    onCloseModal();
  };

  useEffect(() => {
    if (media?.name) {
      setTitle(media.name.split(".").slice(0, -1).join("."));
    }
  }, [media]);

  const displayFilePickerWorkspace = () => {
    return media && magnetType !== "text";
  };

  const displayCaption = () => {
    return magnetType !== "text";
  };

  return (
    <>
      <Modal
        open={isCreateMagnetOpen}
        onClose={() => onCloseModal()}
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
              {t("magneto.new.card")}
            </Typography>
            <IconButton
              onClick={() => onCloseModal()}
              aria-label="close"
              sx={closeButtonStyle}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Box>
          <Box sx={contentContainerStyle}>
            {displayFilePickerWorkspace() && (
              <FilePickerWorkspace addButtonLabel={"Change file"} />
            )}
            <FormControl id="title">
              <Label>{t("magneto.card.title")}</Label>
              <Input
                value={title}
                placeholder={t("magneto.card.title")}
                size="md"
                type="text"
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormControl>
            {displayCaption() && (
              <FormControl id="caption">
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
            <FormControl id="description" style={formControlStyle}>
              <Label>{t("magneto.create.board.description")} :</Label>

              <Box sx={editorStyle}>
                <Editor
                  id="postContent"
                  content={description}
                  mode="edit"
                  ref={editorRef}
                />
              </Box>
            </FormControl>
            <FormControlMUI variant="outlined" sx={formControlMUIStyle}>
              <InputLabel id="input-section" shrink={true} sx={inputLabelStyle}>
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

            <Box sx={modalFooterStyle}>
              <Button
                style={footerButtonStyle}
                color="tertiary"
                variant="filled"
                type="button"
                onClick={() => onCloseModal()}
              >
                {t("magneto.cancel")}
              </Button>
              <Button
                style={footerButtonStyle}
                color="primary"
                type="button"
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
