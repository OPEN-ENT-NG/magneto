import { FC } from "react";

import { Button } from "@edifice-ui/react";
import { Modal, Paper, Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import { modalPaperStyles, titleStyles, buttonContainerStyles } from "./style";
import { CommentConfirmationModalProps } from "./types";
import { transparentBackDrop } from "../comment-panel/style";

const DeleteConfirmationModal: FC<CommentConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  anchorEl,
}) => {
  const { t } = useTranslation("magneto");
  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();

  return (
    <Modal
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: transparentBackDrop,
        },
      }}
    >
      <Paper sx={modalPaperStyles({ rect })}>
        <Typography variant="h6" sx={titleStyles}>
          {t("magneto.delete.comment")}
        </Typography>

        <Box sx={buttonContainerStyles}>
          <Button
            color="tertiary"
            type="button"
            variant="filled"
            onClick={onClose}
          >
            {t("magneto.explorer.cancel")}
          </Button>
          <Button
            color="primary"
            type="submit"
            variant="filled"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {t("magneto.delete")}
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default DeleteConfirmationModal;
