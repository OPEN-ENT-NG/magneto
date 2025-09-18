import { useCallback } from "react";

import { isActionAvailable } from "@edifice.io/client";
import { ThemeProvider } from "@mui/material/styles";
import { useParams } from "react-router-dom";

import { BoardView } from "~/components/board-view/BoardView";
import { workflowName } from "~/config";
import { BoardProvider } from "~/providers/BoardProvider";
import { WebSocketProvider } from "~/providers/WebsocketProvider";
import { useActions } from "~/services/queries";
import theme from "~/themes/theme";

export const App = () => {
  const { id = "" } = useParams();
  const isLocal = window.location.protocol === "http:";
  const getSocketURL = useCallback(() => {
    return isLocal
      ? `ws://${window.location.hostname}:9091/${id}`
      : `wss://${window.location.host}/magneto/ws/${id}`;
  }, [isLocal]);
  const { data: actions } = useActions();
  const canSynchronous = isActionAvailable(workflowName.synchronous, actions);

  return (
    <ThemeProvider theme={theme}>
      <WebSocketProvider
        socketUrl={getSocketURL()}
        onMessage={(update) => {
          console.log("Received WebSocket update:", update);
        }}
        shouldConnect={canSynchronous}
      >
        <BoardProvider>
          <BoardView />
        </BoardProvider>
      </WebSocketProvider>
    </ThemeProvider>
  );
};
