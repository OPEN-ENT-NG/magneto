import { AppHeader, Breadcrumb, Button } from "@edifice-ui/react";
import "./Header.scss";

interface HeaderProps {
  onClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClick }) => {
  return (
    <AppHeader>
      <Breadcrumb
        app={{
          address: "/",
          display: false,
          displayName: "Magneto",
          icon: "",
          isExternal: false,
          name: "",
          scope: [],
        }}
        name="Magnéto / Mes tableaux"
      />
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
