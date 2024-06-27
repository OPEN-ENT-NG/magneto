import { AppHeader, Button } from "@edifice-ui/react";
import "./Header.scss";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { t } from "i18next";

import myimg from "./uni-magneto.png";

interface HeaderProps {
  onClick: () => void;
  toggleDrawer: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClick, toggleDrawer }) => {
  const isAbove1025px = useMediaQuery("(min-width:1025px)");

  return (
    <AppHeader>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={toggleDrawer}
        edge="start"
        sx={{
          mr: 2,
          display: isAbove1025px ? "none" : "inline-flex",
        }}
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
