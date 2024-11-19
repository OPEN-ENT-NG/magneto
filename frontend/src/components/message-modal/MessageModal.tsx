import React from "react";

import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Modal, Typography } from "@mui/material";

import {
  closeButtonStyle,
  contentContainerStyle,
  headerStyle,
  modalContainerStyle,
  modalFooterStyle,
  StyledButton,
  submitButtonsStyle,
  titleStyle,
} from "./style";
import { MessageModalProps } from "./types";

export const MessageModal: React.FunctionComponent<MessageModalProps> = ({
  isOpen,
  title,
  children,
  onSubmit,
  disableSubmit,
  submitButtonName,
  cancelButtonName,
  onClose,
  isHard = false,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={isHard ? () => null : onClose}
      disableEscapeKeyDown={isHard}
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
    >
      <Box sx={modalContainerStyle}>
        <Box sx={headerStyle}>
          {title && title != "" && (
            <Typography
              id="modal-title"
              variant="h4"
              component="h2"
              sx={titleStyle}
            >
              {title}
            </Typography>
          )}
          <IconButton
            onClick={onClose}
            aria-label="close"
            sx={closeButtonStyle}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>

        {children && <Box sx={contentContainerStyle}>{children}</Box>}

        <Box sx={modalFooterStyle}>
          <Box sx={submitButtonsStyle}>
            <StyledButton
              variant="text"
              isFilled={false}
              onClick={() => onClose()}
            >
              {cancelButtonName ? cancelButtonName : "Cancel"}
            </StyledButton>

            {!!onSubmit && (
              <StyledButton
                variant="contained"
                isFilled={true}
                onClick={() => onSubmit()}
                disabled={!!disableSubmit && disableSubmit()}
              >
                {submitButtonName ? submitButtonName : "Submit"}
              </StyledButton>
            )}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};
