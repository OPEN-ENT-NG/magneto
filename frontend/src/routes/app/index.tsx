import { AppView } from "~/components/app-view/AppView";
import { BoardProvider } from "~/providers/BoardProvider";
import { BoardsNavigationProvider } from "~/providers/BoardsNavigationProvider";
import { FoldersNavigationProvider } from "~/providers/FoldersNavigationProvider";
import { WebSocketProvider } from "~/providers/WebsocketProvider";

export const App = () => {
  return (
    <BoardProvider>
      <FoldersNavigationProvider>
        <BoardsNavigationProvider>
          <WebSocketProvider //Not connecting to the websocket, just importing the functions for CreateBoard
            socketUrl={""}
            onMessage={(update) => {
              console.log("Received WebSocket update:", update);
            }}
            shouldConnect={false}
          >
            <AppView />
          </WebSocketProvider>
        </BoardsNavigationProvider>
      </FoldersNavigationProvider>
    </BoardProvider>
  );
};
