import { useCallback } from "react";

import { isActionAvailable } from "@edifice.io/client";
import { useParams } from "react-router-dom";

import { ReadView } from "~/components/read-view/ReadView";
import { workflowName } from "~/config";
import { useWebSocketNotifications } from "~/hooks/useWebSocketNotifications";
import { BoardProvider } from "~/providers/BoardProvider";
import { WebSocketProvider } from "~/providers/WebsocketProvider";
import { useActions } from "~/services/queries";

export const App = () => {
  const { id = "" } = useParams();
  const { handleWebSocketUpdate } = useWebSocketNotifications();
  const isLocalhost = window.location.hostname === "localhost";
  const getSocketURL = useCallback(() => {
    return isLocalhost
      ? `ws://${window.location.hostname}:9091/${id}`
      : `wss://${window.location.host}/magneto/ws/${id}`;
  }, [isLocalhost]);
  const { data: actions } = useActions();
  const canSynchronous = isActionAvailable(workflowName.synchronous, actions);

  return (
    <WebSocketProvider
      socketUrl={getSocketURL()}
      onMessage={(update) => {
        console.log("Received WebSocket update:", update);
        handleWebSocketUpdate(update);
      }}
      shouldConnect={canSynchronous}
    >
      <BoardProvider>
        <ReadView />
      </BoardProvider>
    </WebSocketProvider>
  );
};
