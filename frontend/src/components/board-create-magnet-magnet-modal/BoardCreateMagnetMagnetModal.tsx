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
import { BoardCreateMagnetMagnetModalProps } from "./types";
import { StyledRadio } from "../styled-radio/StyledRadio";
import { useDeleteSectionMutation } from "~/services/api/sections.service";

export const BoardCreateMagnetMagnetModal: FC<BoardCreateMagnetMagnetModalProps> = ({
  open,
  onClose,
}) => {

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
            {t("")}
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
       
        </Box>
        <Box sx={modalFooterStyle}>
     
        </Box>
      </Box>
    </Modal>
  );
};
