import { FC } from "react";

import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Modal, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  modalContainerStyle,
  headerStyle,
  titleStyle,
  closeButtonStyle,
  contentContainerStyle,
  descriptionStyle,
} from "./style";
import { DescriptionModalProps } from "./types";

export const DescriptionModal: FC<DescriptionModalProps> = ({
  open,
  onClose,
  title,
  description,
}) => {

  return (
    <Modal
      open={open}
      onClose={onClose}
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
            {title}
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
            {description}
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
};
