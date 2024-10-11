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
            {media && <FilePickerWorkspace addButtonLabel={"Change file"} />}
            <FormControl id="title" className="mb-0-5">
              <Label>{t("magneto.card.title")}</Label>
              <Input
                value={title}
                placeholder={t("magneto.card.title")}
                size="md"
                type="text"
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormControl>
            <FormControl id="caption" className="mb-0-5">
              <Label>{t("magneto.card.caption")}</Label>
              <Input
                value={caption}
                placeholder={t("magneto.card.caption")}
                size="md"
                type="text"
                onChange={(e) => setCaption(e.target.value)}
              />
            </FormControl>
            <FormControl
              id="description"
              className="mb-1-5"
              style={{ marginBottom: "3rem" }}
            >
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
            <FormControlMUI
              variant="outlined"
              sx={{ minWidth: 200, marginBottom: "1rem", width: "100%" }}
            >
              <InputLabel
                id="demo-simple-select-outlined-label"
                shrink={true}
                sx={{
                  background: "white",
                  padding: "0.2rem 4px",
                  marginLeft: "-4px",
                  transform: "translate(14px, -9px) scale(0.75)",
                  fontSize: "1.7rem",
                }}
              >
                {t("magneto.card.section")}
              </InputLabel>
              <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={section.title}
                onChange={handleSectionChange}
                label={t("magneto.card.section")}
                notched
                size="medium"
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    "& caption": {
                      width: "0px",
                      paddingTop: "0rem",
                    },
                  },
                  "& .MuiSelect-select": {
                    paddingTop: "10px",
                    paddingBottom: "0px",
                    fontSize: "1.7rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                  height: "4rem",
                  width: "100%",
                }}
              >
                {board.sections.map((s: Section) => (
                  <MenuItem key={s.title} value={s.title}>
                    <Box
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: "1.7rem",
                        width: "145rem",
                        maxWidth: "100%",
                      }}
                    >
                      {s.title}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControlMUI>

            <Box sx={modalFooterStyle}>
              <Button
                style={{ marginLeft: "0" }}
                color="tertiary"
                variant="filled"
                type="button"
                className="button"
                onClick={() => onCloseModal()}
              >
                {t("magneto.cancel")}
              </Button>
              <Button
                style={{ marginLeft: "0" }}
                color="primary"
                type="button"
                variant="filled"
                onClick={() => onUpload()}
                className="button"
              >
                {t("magneto.save")}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      <Box sx={{ position: "fixed", zIndex: 1100 }}>
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
