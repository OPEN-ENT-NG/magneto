import { AppHeader, Breadcrumb, Button } from "@edifice-ui/react";
import "./Header.scss";

export default function Header() {
  return (
    <AppHeader
      render={function Ga() {
        return null;
      }}
    >
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
      <Button color="primary" type="button" variant="filled" className="button">
        Créer un tableau
      </Button>
    </AppHeader>
  );
}
