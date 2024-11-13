import { Box, Button, IconButton, Modal, Typography } from "@mui/material";
import React from "react";

import CloseIcon from "@mui/icons-material/Close";

import { useTranslation } from "react-i18next";
import {
  closeButtonStyle,
  headerStyle,
  modalContainerStyle,
  modalFooterStyle,
  submitButtonsStyle,
  titleStyle,
} from "./style";

type MessageModalProps = {
  isOpen: boolean;
  title?: string;
  i18nKey: string;
  param?: string;
  onSubmit?: () => void;
  disableSubmit?: () => boolean;
  submitButtonName?: string;
  onClose: () => void;
};

export const MessageModal: React.FunctionComponent<MessageModalProps> = ({
  isOpen,
  title,
  i18nKey,
  param,
  onSubmit,
  disableSubmit,
  submitButtonName,
  onClose,
}) => {
  const { t } = useTranslation("magneto");

  return (
    <>
      {isOpen && (
        <Modal
          open={isOpen}
          onClose={onClose}
          aria-labelledby="modal-title"
          aria-describedby="modal-message"
        >
          <Box sx={modalContainerStyle}>
            <Box sx={headerStyle}>
              <Typography
                id="modal-title"
                variant="h4"
                component="h2"
                sx={titleStyle}
              >
                {!!i18nKey && !!param && param != ""
                  ? t(i18nKey, { 0: param })
                  : t(i18nKey)}
              </Typography>
              <IconButton
                onClick={onClose}
                aria-label="close"
                sx={closeButtonStyle}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </Box>

            <Box sx={modalFooterStyle}>
              <Box sx={submitButtonsStyle}>
                <Button
                  // color="tertiary"
                  variant="outlined"
                  onClick={() => onClose()}
                >
                  {t("magneto.cancel")}
                </Button>
                <Box sx={contentContainerStyle}>
                  {useRenderContent(inputValue, setInputValue)}
                </Box>
                {!!onSubmit && (
                  <Button
                    variant="contained"
                    onClick={() => onSubmit()}
                    disabled={!!disableSubmit && disableSubmit()}
                  >
                    {submitButtonName
                      ? t(submitButtonName)
                      : t("magneto.submit")}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
          {/* <Modal.Header onModalClose={onCancel}> </Modal.Header>
          <Modal.Body>
            {!!i18nKey && !!param && param != ""
              ? t(i18nKey, { 0: param })
              : t(i18nKey)}
          </Modal.Body>

          <Modal.Footer>
            <div className="right">
              <Button
                color="tertiary"
                type="button"
                variant="ghost"
                className="footer-button"
                onClick={onCancel}
              >
                {t("magneto.cancel")}
              </Button>
              {hasSubmit && (
                <Button
                  color="primary"
                  type="submit"
                  variant="filled"
                  className="footer-button"
                  onClick={onSubmit}
                >
                  {t("magneto.confirm")}
                </Button>
              )}
            </div>
          </Modal.Footer> */}
        </Modal>
      )}
    </>
  );
};
