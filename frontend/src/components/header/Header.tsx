import { AppHeader, Button } from "@edifice-ui/react";
import "./Header.scss";
import { t } from "i18next";

import myimg from "./uni-magneto.png";

interface HeaderProps {
  onClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClick }) => {
  return (
    <AppHeader>
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
