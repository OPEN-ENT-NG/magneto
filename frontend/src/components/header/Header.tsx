import { AppHeader, Button, useOdeClient } from "@edifice-ui/react";
import "./Header.scss";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import { useTranslation } from "react-i18next";

import myimg from "./uni-magneto.png";
import { useFoldersNavigation } from "~/providers/FoldersNavigationProvider";
import { folderHasShareRights } from "~/utils/share.utils";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { useEffect, useState } from "react";

interface HeaderProps {
  onClick: () => void;
  toggleDrawer: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClick, toggleDrawer }) => {
  const { t } = useTranslation("magneto");
  const { user } = useOdeClient();
  const { currentFolder } = useFoldersNavigation();
  const [isFolderOwnerOrSharedWithRights, setIsFolderOwnerOrSharedWithRights] = useState<boolean>(false);
  
  useEffect(() => {
    setIsFolderOwnerOrSharedWithRights(currentFolder.id == FOLDER_TYPE.MY_BOARDS || currentFolder.ownerId === user?.userId || folderHasShareRights(currentFolder, "publish", user));
  }, [currentFolder]);
  

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
      {isFolderOwnerOrSharedWithRights && <Button
        color="primary"
        type="button"
        variant="filled"
        onClick={onClick}
        className="button"
      >
        {t("magneto.create.board")}
      </Button>}
    </AppHeader>
  );
};

export default Header;

