import React, { ReactNode } from "react";

import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Modal, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

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

export type MessageModalProps = {
  isOpen: boolean;
  title?: string;
  children?: ReactNode;
  onSubmit?: () => void;
  disableSubmit?: () => boolean;
  submitButtonName?: string;
  onClose: () => void;
  // isHard?: boolean;
};

export const MessageModal: React.FunctionComponent<MessageModalProps> = ({
  isOpen,
  title,
  children,
  onSubmit,
  disableSubmit,
  submitButtonName,
  onClose,
  // isHard = false,
}) => {
  const { t } = useTranslation("magneto");

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      // isHard={isHard}
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
              {t("magneto.cancel")}
            </StyledButton>

            {!!onSubmit && (
              <StyledButton
                variant="contained"
                isFilled={true}
                onClick={() => onSubmit()}
                disabled={!!disableSubmit && disableSubmit()}
              >
                {submitButtonName ? t(submitButtonName) : t("magneto.submit")}
              </StyledButton>
            )}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};
