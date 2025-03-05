import React, { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Box,
  Tab,
  Tabs,
  Typography,
  Modal,
  IconButton,
} from "@cgi-learning-hub/ui";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import { Trans, useTranslation } from "react-i18next";

import {
  alertListItemBulletStyle,
  alertListItemContentStyle,
  alertListItemStyle,
  alertListStyle,
  alertTitleStyle,
  buttonStyle,
  exportContentStyle,
  exportTitleStyle,
  tabsStyle,
  tabStyle,
} from "./style";
import { ExportModalProps } from "./types";
import {
  closeButtonStyle,
  headerStyle,
  modalContainerStyle,
  modalFooterStyle,
  titleStyle,
} from "../message-modal/style";
import { useBoardsNavigation } from "~/providers/BoardsNavigationProvider";
import { useExportBoardQuery } from "~/services/api/export.service.ts";

export const ExportModal: React.FunctionComponent<ExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation("magneto");
  const [tabValue] = useState(0);
  const { selectedBoardsIds, selectedBoards } = useBoardsNavigation();

  const [shouldFetch, setShouldFetch] = useState(false);

  const { data, error, isLoading } = useExportBoardQuery(selectedBoardsIds[0], {
    skip: !shouldFetch,
  });
  const handleExport = () => {
    setShouldFetch(true);
  };

  useEffect(() => {
    if (data) {
      const blob = new Blob([data], {
        type: "application/zip",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${selectedBoards[0]._title}.zip`);
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      setShouldFetch(false);
      onClose();
    }
  }, [data]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      console.error("Erreur lors de l'export:", error);
      setShouldFetch(false);
    }
  }, [error]);

  return (
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
            {t("magneto.board.export")}
          </Typography>
          <IconButton
            onClick={onClose}
            aria-label="close"
            sx={closeButtonStyle}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>

        <Box>
          <Tabs
            sx={tabsStyle}
            value={tabValue}
            onChange={() => console.log("to be")}
            variant="scrollable"
            scrollButtons="false"
          >
            <Tab
              label={t("magneto.board.download")}
              icon={<DownloadIcon fontSize="large" />}
              sx={tabStyle}
            />
          </Tabs>
          <Box>
            {tabValue === 0 && (
              <Box>
                <Typography variant="h2" sx={exportTitleStyle}>
                  {t("magneto.export.modal.format")}
                </Typography>
                <Typography sx={exportContentStyle}>
                  {t("magneto.export.modal.content")}
                </Typography>
                <Alert severity="info">
                  <Box sx={alertTitleStyle}>
                    {t("magneto.export.modal.informations")}
                  </Box>
                  <Box component="ul" sx={alertListStyle}>
                    <Box component="li" sx={alertListItemStyle}>
                      <Box sx={alertListItemBulletStyle}>•</Box>
                      <Box sx={alertListItemContentStyle}>
                        <Trans
                          ns="magneto"
                          i18nKey="magneto.export.modal.text.1"
                          components={{
                            bold: <strong />,
                          }}
                        />
                      </Box>
                    </Box>
                    <Box component="li" sx={alertListItemStyle}>
                      <Box sx={alertListItemBulletStyle}>•</Box>
                      <Box sx={alertListItemContentStyle}>
                        <Trans
                          ns="magneto"
                          i18nKey="magneto.export.modal.text.2"
                          components={{
                            bold: <strong />,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Alert>
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={modalFooterStyle}>
          <Button
            variant="text"
            color="primary"
            size="medium"
            sx={buttonStyle}
            onClick={onClose}
          >
            {t("magneto.cancel")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            sx={buttonStyle}
            onClick={handleExport}
            loading={isLoading}
          >
            {t("magneto.board.download")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
