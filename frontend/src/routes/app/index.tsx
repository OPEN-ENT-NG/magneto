import { AppView } from "~/components/app-view/AppView";
import { BoardProvider } from "~/providers/BoardProvider";
import { BoardsNavigationProvider } from "~/providers/BoardsNavigationProvider";
import { FoldersNavigationProvider } from "~/providers/FoldersNavigationProvider";

export const App = () => {
  return (
    <BoardProvider>
      <FoldersNavigationProvider>
        <BoardsNavigationProvider>
          <AppView />
        </BoardsNavigationProvider>
      </FoldersNavigationProvider>
    </BoardProvider>
  );
};
