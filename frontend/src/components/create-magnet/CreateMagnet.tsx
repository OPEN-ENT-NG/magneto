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
} from "./style";
import { useMediaLibrary } from "~/providers/MediaLibraryProvider";
import {
  Button,
  FormControl,
  Input,
  Label,
  MediaLibrary,
  TextArea,
  useOdeClient,
} from "@edifice-ui/react";
import { Editor, EditorRef } from "@edifice-ui/editor";
import { useTranslation } from "react-i18next";
import { CardContentSvgDisplay } from "../card-content-svg-display/CardContentSvgDisplay";
import { getFileExtension } from "~/hooks/useGetExtension";
import { Section } from "~/providers/BoardProvider/types";
import { useBoard } from "~/providers/BoardProvider";

export const modalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  width: "100%",
  gap: "1rem",
};

const svgContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "200px", // Ajustez cette valeur selon vos besoins
  marginBottom: "1rem",
};

const svgStyle = {
  width: "20%",
  height: "auto",
  maxHeight: "100%",
};

const editorStyle = {
  "& .ProseMirror[contenteditable='true']": {
    minHeight: "180px",
  },
};

export const CreateMagnet: FC = () => {
  const { appCode } = useOdeClient();
  const { t } = useTranslation("magneto");

  const [isOpen, setIsOpen] = useState(false);
  const { board } = useBoard();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [section, setSection] = useState<Section>(board.sections[0]);
  const [summaryContent, setSummaryContent] = useState<string>("");
  const editorRef = useRef<EditorRef>(null);

  const { mediaLibraryRef, libraryMedia, mediaLibraryHandlers, media } =
    useMediaLibrary();

  const handleSectionChange = (event: SelectChangeEvent<string>) => {
    const sectionTitle = event.target.value;
    const selectedSection = board.sections.find(
      (s) => s.title === sectionTitle,
    );
    if (selectedSection) {
      setSection(selectedSection);
    }
  };

  useEffect(() => {
    if (libraryMedia) setIsOpen(true);
    console.log(media);
    console.log(libraryMedia);
  }, [libraryMedia]);

  useEffect(() => {
    console.log(editorRef.current?.getContent("html") as string);
  }, [editorRef]);

  return (
    <>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalContainerStyle}>
          <Box sx={headerStyle}>
            <Typography
              id="modal-title"
              variant="h4"
              component="h2"
              sx={titleStyle}
            >
              Nouvel aimant
            </Typography>
            <IconButton
              onClick={() => setIsOpen(false)}
              aria-label="close"
              sx={closeButtonStyle}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Box>
          <Box sx={contentContainerStyle}>
            {media && (
              <Box sx={svgContainerStyle}>
                <Box sx={svgStyle}>
                  <CardContentSvgDisplay
                    extension={getFileExtension(media?.name)}
                  />
                </Box>
              </Box>
            )}
            <FormControl id="title" className="mb-0-5">
              <Label>Titre</Label>
              <Input
                value={title}
                placeholder="Titre"
                size="md"
                type="text"
                onChange={(e) => setTitle(e.target.value)}
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
                  content={summaryContent}
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
                Section
              </InputLabel>
              <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={section.title}
                onChange={handleSectionChange}
                label="Section"
                notched
                size="medium"
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    "& legend": {
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
                onClick={() =>
                  console.log(editorRef.current?.getContent("html"))
                }
                className="button"
              >
                {t("magneto.cancel")}
              </Button>
              <Button
                style={{ marginLeft: "0" }}
                color="primary"
                type="button"
                variant="filled"
                onClick={() => setIsOpen(false)}
                className="button"
              >
                {t("magneto.save")}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      <MediaLibrary
        appCode={appCode}
        ref={mediaLibraryRef}
        multiple={false}
        visibility="protected"
        {...mediaLibraryHandlers}
      />
    </>
  );
};
