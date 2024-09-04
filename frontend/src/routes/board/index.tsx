import { HeaderView } from "~/components/header-view/HeaderView";
import { SideMenu } from "~/components/side-menu/SideMenu";
import { useSideMenuData } from "~/hooks/useSideMenuData";
import { BoardProvider } from "~/providers/BoardProvider";

export const App = () => {
  const sideMenuData = useSideMenuData();

  return (
    <BoardProvider>
      <HeaderView />
      <SideMenu sideMenuData={sideMenuData} />
    </BoardProvider>
  );
};
