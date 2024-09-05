import { BoardView } from "~/components/board-view/BoardView";
import { HeaderView } from "~/components/header-view/HeaderView";
import { BoardProvider } from "~/providers/BoardProvider";

export const App = () => {
  return (
    <BoardProvider>
      <HeaderView />
      <BoardView />
    </BoardProvider>
  );
};
