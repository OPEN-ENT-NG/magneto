import { AppView } from "~/components/app-view/AppView";
import { BoardsNavigationProvider } from "~/providers/BoardsNavigationProvider";
import { FoldersNavigationProvider } from "~/providers/FoldersNavigationProvider";

export const App = () => {
  return (
    <FoldersNavigationProvider>
      <BoardsNavigationProvider>
        <AppView />
      </BoardsNavigationProvider>
    </FoldersNavigationProvider>
  );
};
