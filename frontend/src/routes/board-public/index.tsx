import { ThemeProvider } from "@mui/material/styles";
import { useParams } from "react-router-dom";

import { BoardView } from "~/components/board-view/BoardView";
import { BoardProvider } from "~/providers/BoardProvider";
import { useGetIsExternalQuery } from "~/services/api/boards.service"; // Importation du hook RTK Query
import theme from "~/themes/theme";

export const App = () => {
  // Appel au hook RTK Query
  console.log("cc!!");
  const { id = "" } = useParams();

  const { data: isExternalQueryAllowed } = useGetIsExternalQuery(id);

  // Si le résultat est faux, affiche une page d'erreur
  console.log(isExternalQueryAllowed);
  if (!isExternalQueryAllowed) {
    return (
      <ThemeProvider theme={theme}>
        <div className="error-page">
          <h1>Erreur d'accès</h1>
          <p>Vous n'avez pas l'autorisation d'accéder à cette ressource.</p>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <BoardProvider isExternal={isExternalQueryAllowed}>
        <BoardView />
      </BoardProvider>
    </ThemeProvider>
  );
};
