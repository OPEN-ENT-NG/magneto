import { useCallback } from "react";

import { ThemeProvider } from "@mui/material/styles";
import { useParams } from "react-router-dom";

import { BoardView } from "~/components/board-view/BoardView";
import { BoardProvider } from "~/providers/BoardProvider";
import { WebSocketProvider } from "~/providers/WebsocketProvider";
import theme from "~/themes/theme";

export const App = () => {
  const { id = "" } = useParams();
  const isLocalhost = window.location.hostname === "localhost";
  const getSocketURL = useCallback(() => {
    return isLocalhost
      ? `ws://localhost:9091/${id}`
      : `wss://ng2.support-ent.fr/magneto/ws/${id}`;
  }, [isLocalhost]);

  return (
    <ThemeProvider theme={theme}>
      <WebSocketProvider
        socketUrl={getSocketURL()}
        onMessage={(update) => {
          console.log("Received WebSocket update:", update);
        }}
      >
        <BoardProvider>
          <BoardView />
        </BoardProvider>
      </WebSocketProvider>
    </ThemeProvider>
  );
};
