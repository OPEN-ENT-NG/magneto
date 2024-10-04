import { FC, useEffect, useState } from "react";

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
  descriptionStyle,
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

export const modalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  width: "100%",
  gap: "1rem",
};

export const CreateMagnet: FC = () => {
  const { appCode } = useOdeClient();
  const { t } = useTranslation("magneto");

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [section, setSection] = useState("Section 1");

  const handleChange = (event: SelectChangeEvent) => {
    setSection(event.target.value as string);
  };

  const { mediaLibraryRef, libraryMedia, mediaLibraryHandlers, media } =
    useMediaLibrary();

  useEffect(() => {
    if (libraryMedia) setIsOpen(true);
  }, [libraryMedia]);

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
              <Editor
                id="postContent"
                ref={editorRef}
                content=""
                mode="edit"
                visibility={
                  blog?.visibility === "PUBLIC" ? "public" : "protected"
                }
                onContentChange={handleContentChange}
              ></Editor>
            </FormControl>
            <FormControlMUI
              variant="outlined"
              sx={{ minWidth: 200, marginBottom: "1rem" }}
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
                value={section}
                onChange={handleChange}
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
                    paddingTop: "25px",
                    paddingBottom: "20px",
                    fontSize: "1.7rem",
                  },
                  height: "60px",
                }}
              >
                <MenuItem value={"Section 1"}>Section 1</MenuItem>
                <MenuItem value={"Section 2"}>Section 2</MenuItem>
                <MenuItem value={"Section 3"}>Section 3</MenuItem>
              </Select>
            </FormControlMUI>
          </Box>
          <Box sx={modalFooterStyle}>
            <Button
              style={{ marginLeft: "0" }}
              color="tertiary"
              variant="filled"
              type="button"
              onClick={() => setIsOpen(false)}
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
