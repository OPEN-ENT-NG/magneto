import React, { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from "@cgi-learning-hub/ui";
import { useToast } from "@edifice.io/react";
import { Switch } from "@mui/material";
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
} from "./style";
import { ExportModalProps } from "./types";
import { actionStyle, dialogStyle, titleStyle } from "../message-modal/style";
import { TabList } from "../tab-list/TabList";
import { CURRENTTAB_STATE } from "../tab-list/types";
import { EXPORT_TABS_CONFIG } from "../tab-list/utils";
import { TextFieldWithCopyButton } from "../textfield-with-copy-button/TextfieldWithCopyButton";
import { getIframeCode } from "~/core/constants/export-iFrame.const";
import { useBoardsNavigation } from "~/providers/BoardsNavigationProvider";
import { useExportBoardQuery } from "~/services/api/export.service.ts";

export const ExportModal: React.FunctionComponent<ExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation("magneto");
  const toast = useToast();
  const { selectedBoardsIds, selectedBoards } = useBoardsNavigation();

  const [currentTab, setCurrentTab] = useState<CURRENTTAB_STATE>(
    CURRENTTAB_STATE.EXPORT_PPTX,
  );

  const [shouldFetch, setShouldFetch] = useState(false);
  const [isExternalInput, setIsExternalInput] = useState(false);
  const [value, setValue] = useState("");

  const { data, error, isLoading } = useExportBoardQuery(selectedBoardsIds[0], {
    skip: !shouldFetch,
  });

  const handleConfirm = () => {
    if (currentTab === CURRENTTAB_STATE.EXPORT_PPTX) {
      setShouldFetch(true);
    } else {
      navigator.clipboard.writeText(value).then(() => {
        toast.success(t("magneto.share.public.input.tooltip.copied"));
      });
    }
  };
  const handleExternalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsExternalInput(event.target.checked);
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

              // Afficher les toasts avec la liste formatée
              if (formattedErrors)
                toast.warning(
                  `${t("magneto.export.toast.warning")} ${formattedErrors}`,
                );
            } catch (e) {
              console.error("Erreur de parsing:", e);
            }
          }

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

          //Success
          toast.success(t("magneto.export.toast.success"));
        } catch (downloadError) {
          console.error("Erreur lors du téléchargement:", downloadError);
          toast.error(t("magneto.export.toast.error"));
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

  useEffect(() => {
    if (selectedBoards.length > 0) {
      setValue(getIframeCode(isExternalInput, selectedBoards[0].id));
    }
  }, [selectedBoards, isExternalInput]);

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
        <TabList
          currentTab={currentTab}
          onChange={setCurrentTab}
          tabsConfig={EXPORT_TABS_CONFIG}
        />
        <Box>
          {currentTab === CURRENTTAB_STATE.EXPORT_PPTX && (
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
          {currentTab === CURRENTTAB_STATE.EXPORT_IFRAME && (
            <Box sx={{ height: "100%" }}>
              <Typography variant="h3" sx={exportTitleStyle}>
                {t("magneto.embed.modal.format")}
              </Typography>
              <Alert severity="warning" sx={{ marginY: "1.6rem" }}>
                <Box sx={alertListStyle}>
                  {t("magneto.embed.modal.warning")}
                </Box>
              </Alert>
              {selectedBoards[0].isExternal && (
                <Stack
                  direction="row"
                  alignItems={"center"}
                  spacing={1}
                  useFlexGap
                  className="mt-16"
                  mb={2}
                >
                  <Switch
                    checked={isExternalInput}
                    onChange={handleExternalChange}
                  />
                  <Typography
                    sx={{ fontSize: "1.6rem", whiteSpace: "pre-line" }}
                  >
                    {t("magneto.embed.modal.switch")}
                  </Typography>
                </Stack>
              )}
              <TextFieldWithCopyButton
                value={value} // Use the value state here
                label={"Code"}
                readOnly={true}
                largerCopy
                isMultiline
              />
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
          onClick={handleConfirm}
          loading={isLoading}
        >
          {currentTab === CURRENTTAB_STATE.EXPORT_PPTX
            ? t("magneto.board.download")
            : t("magneto.embed.modal.copy")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
