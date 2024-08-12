import { AppHeader, Button } from "@edifice-ui/react";
import "./Header.scss";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import { useTranslation } from "react-i18next";

import myimg from "./uni-magneto.png";
import { useBoardsNavigation } from "~/providers/BoardsNavigationProvider";

interface HeaderProps {
  onClick: () => void;
  toggleDrawer: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClick, toggleDrawer }) => {
  const { t } = useTranslation("magneto");

  const { selectedBoards } = useBoardsNavigation();

  const isMyBoards = selectedBoards.every(
    (board:) => board.owner.userId === userId,
  )

  const isFolderOwnerOrSharedWithRights: boolean =
      isMyBoards || folderHasShareRight(folders[0], "manager");


  return (
    <AppHeader>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={toggleDrawer}
        edge="start"
        className="drawer-button"
      >
        <MenuIcon />
      </IconButton>
      <div className="header-left">
        <img src={myimg} alt="Logo" className="logo" />
        <span className="header-text">{t("magneto.header.my.boards")}</span>
      </div>
      <Button
        color="primary"
        type="button"
        variant="filled"
        onClick={onClick}
        className="button"
      >
        Créer un tableau
      </Button>
    </AppHeader>
  );
};

export default Header;
