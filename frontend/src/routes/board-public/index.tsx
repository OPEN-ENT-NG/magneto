import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useParams } from "react-router-dom";

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
  if (true) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            paddingTop: "20vh",
          }}
        >
          <Box sx={{ width: "30%" }}>
            <EmptyStatePublic
              title={"Aucun tableau trouvé"}
              description="Le tableau Magnéto que vous cherchez semble introuvable. Il se peut que l'URL soit mal orthographiée, ou que le tableau n'existe plus ou ne soit plus partagé."
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
