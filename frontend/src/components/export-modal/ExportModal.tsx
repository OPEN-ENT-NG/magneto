import React, { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Box,
  Tab,
  Tabs,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@cgi-learning-hub/ui";
import { useToast } from "@edifice.io/react";
import DownloadIcon from "@mui/icons-material/Download";
import { Trans, useTranslation } from "react-i18next";

import {
  alertListItemBulletStyle,
  alertListItemContentStyle,
  alertListItemStyle,
  alertListStyle,
  alertTitleStyle,
  buttonStyle,
  contentStyle,
  exportContentStyle,
  exportTitleStyle,
  tabsStyle,
  tabStyle,
} from "./style";
import { ExportModalProps } from "./types";
import { actionStyle, dialogStyle, titleStyle } from "../message-modal/style";
import { useBoardsNavigation } from "~/providers/BoardsNavigationProvider";
import { useExportBoardQuery } from "~/services/api/export.service.ts";

export const ExportModal: React.FunctionComponent<ExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation("magneto");
  const toast = useToast();
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
    const triggerDownload = async () => {
      if (data) {
        try {
          // Récupérer l'en-tête X-Cards-With-Errors
          const cardsWithErrorsHeader = data.headers["x-cards-with-errors"];
          if (cardsWithErrorsHeader) {
            try {
              const errorCardsList = JSON.parse(cardsWithErrorsHeader);
              const formattedErrors = errorCardsList
                .map((card: string) => `"${card}"`)
                .join(", ");

              console.log(formattedErrors);
              // Afficher les toasts avec la liste formatée
              if (formattedErrors)
                toast.warning(
                  `ça c'est les cartes pas bien : ${formattedErrors}`,
                );
            } catch (e) {
              console.error("Erreur de parsing:", e);
            }
          }
          toast.warning("ça c'est les cartes pas bien : ");

          const blob = data.data;
          const url = window.URL.createObjectURL(blob);

          // Créer un élément <a> pour le téléchargement
          const link = document.createElement("a");
          link.href = url;
          link.download = `${selectedBoards[0]._title}.zip`;

          // Ajouter à la page et déclencher le téléchargement
          document.body.appendChild(link);
          link.click();

          // Nettoyer
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (downloadError) {
          console.error("Erreur lors du téléchargement:", downloadError);
        } finally {
          setShouldFetch(false);
          onClose();
        }
      }
    };

    triggerDownload();
  }, [data, selectedBoards, onClose]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      console.error("Erreur lors de l'export:", error);
      setShouldFetch(false);
    }
  }, [error]);

  return (
    <Dialog
      sx={dialogStyle}
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
    >
      <DialogTitle fontWeight="bold" component="h2" sx={titleStyle}>
        {t("magneto.board.export")}
      </DialogTitle>
      <DialogContent sx={contentStyle}>
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
              <Typography variant="h3" sx={exportTitleStyle}>
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
      </DialogContent>
      <DialogActions sx={actionStyle}>
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
      </DialogActions>
    </Dialog>
  );
};
