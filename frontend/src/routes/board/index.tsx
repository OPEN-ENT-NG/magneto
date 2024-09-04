import { BoardView } from "~/components/board-view/BoardView";
import { HeaderView } from "~/components/header-view/HeaderView";
import { SideMenu } from "~/components/side-menu/SideMenu";
import { ZoomComponent } from "~/components/zoom-component/ZoomComponent";
import { useSideMenuData } from "~/hooks/useSideMenuData";
import { Board } from "~/models/board.model";
import { BoardProvider, useBoard } from "~/providers/BoardProvider";

export const App = () => {


  return (
    <BoardProvider>
      <HeaderView />
      <BoardView />
    </BoardProvider>
  );
};
