import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { emptyStateStyle } from "../board-public/style";
import {
  loadingContainerStyle,
  loadingTextStyle,
} from "~/components/card-content-board/style";
import { EmptyStatePublic } from "~/components/empty-state-public/EmptyStatePublic";
import { ReadView } from "~/components/read-view/ReadView";
import { BoardProvider } from "~/providers/BoardProvider";
import { useGetIsExternalQuery } from "~/services/api/boards.service";
import theme from "~/themes/theme";

export const App = () => {
  // Appel au hook RTK Query
  const { id = "" } = useParams();
  const { t } = useTranslation("magneto");

  const { data: isExternalQueryAllowed, isLoading } = useGetIsExternalQuery(id);

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        {isLoading && (
          <Box sx={loadingContainerStyle}>
            <Box sx={loadingTextStyle}>{t("magneto.loading")}</Box>
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
          <Box sx={{ width: "30%" }}>
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
        <ReadView />
      </BoardProvider>
    </ThemeProvider>
  );
};
