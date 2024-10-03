import { ChangeEvent, FC, useState } from "react";

import { Button, useToast } from "@edifice-ui/react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  FormControl,
  IconButton,
  Modal,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  closeButtonStyle,
  contentContainerStyle,
  descriptionStyle,
  headerStyle,
  modalContainerStyle,
  modalFooterStyle,
  StyledFormControlLabel,
  titleStyle,
} from "./style";
import { DeleteSectionModalProps } from "./types";
import { StyledRadio } from "../styled-radio/StyledRadio";
import { useDeleteSectionMutation } from "~/services/api/sections.service";

export const DeleteSectionModal: FC<DeleteSectionModalProps> = ({
  open,
  onClose,
  section,
}) => {
  const [inputValue, setInputValue] = useState<boolean>(true);
  const { t } = useTranslation("magneto");
  const { boardId, _id: id } = section;
  const [deleteSection] = useDeleteSectionMutation();
  const toast = useToast();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value === "true");
  };
  const handleSubmit = async () => {
    const payload = { boardId, sectionIds: [id], deleteCards: inputValue };
    try {
      await deleteSection(payload);
      toast.success(t("magneto.delete.section.confirm"));
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-section-deletion"
    >
      <Box sx={modalContainerStyle}>
        <Box sx={headerStyle}>
          <Typography
            id="modal-title"
            variant="h4"
            component="h2"
            sx={titleStyle}
          >
            {t("magneto.delete.section")}
          </Typography>
          <IconButton
            onClick={onClose}
            aria-label="close"
            sx={closeButtonStyle}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
        <Box sx={contentContainerStyle}>
          <Typography id="modal-description" sx={descriptionStyle}>
            {t("magneto.delete.section.message")}
          </Typography>
          <FormControl sx={{ width: "100%" }}>
            <RadioGroup
              sx={{ width: "100%" }}
              defaultValue={true}
              aria-labelledby="delete-section-radio"
              name="delete-section-radio"
              value={inputValue.toString()}
              onChange={handleChange}
            >
              <StyledFormControlLabel
                value="true"
                control={<StyledRadio />}
                label={t("magneto.yes")}
              />
              <StyledFormControlLabel
                value="false"
                control={<StyledRadio />}
                label={t("magneto.no")}
              />
            </RadioGroup>
          </FormControl>
        </Box>
        <Box sx={modalFooterStyle}>
          <Button
            style={{ marginLeft: "0" }}
            color="tertiary"
            variant="filled"
            type="button"
            onClick={onClose}
            className="button"
          >
            {t("magneto.cancel")}
          </Button>
          <Button
            style={{ marginLeft: "0" }}
            color="primary"
            type="button"
            variant="filled"
            onClick={handleSubmit}
            className="button"
          >
            {t("magneto.delete")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
