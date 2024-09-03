import { HeaderView } from "~/components/header-view/HeaderView";
import { BoardProvider } from "~/providers/BoardProvider";

export const App = () => {
  return (
    <BoardProvider>
      <HeaderView />
    </BoardProvider>
  );
};
