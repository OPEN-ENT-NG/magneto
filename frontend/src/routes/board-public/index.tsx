import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { emptyStateStyle } from "./style";
import { BoardView } from "~/components/board-view/BoardView";
import {
  loadingContainerStyle,
  loadingTextStyle,
} from "~/components/card-content-board/style";
import { EmptyStatePublic } from "~/components/empty-state-public/EmptyStatePublic";
import { BoardProvider } from "~/providers/BoardProvider";
import { useGetIsExternalQuery } from "~/services/api/boards.service"; // Importation du hook RTK Query
import theme from "~/themes/theme";
import "./removeDisconnectLightbox.scss";

export const App = () => {
  // Appel au hook RTK Query
  const { id = "" } = useParams();
  const { t } = useTranslation("magneto");
  console.log("coucouuu");

  const { data: isExternalQueryAllowed, isLoading } = useGetIsExternalQuery(id);

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        {isLoading && (
          <Box sx={loadingContainerStyle}>
            <Box sx={loadingTextStyle}>Chargement...</Box>
          </Box>
        )}
      </ThemeProvider>
    );
  }

  // Si le résultat est faux, affiche une page d'erreur
  if (!isExternalQueryAllowed?.isExternal) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={emptyStateStyle}>
          <Box sx={{ width: "50%" }}>
            <EmptyStatePublic
              title={t("magneto.public.empty.state.title")}
              description={t("magneto.public.empty.state.content")}
            />
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <BoardProvider isExternal={isExternalQueryAllowed?.isExternal}>
        <BoardView />
      </BoardProvider>
    </ThemeProvider>
  );
};
