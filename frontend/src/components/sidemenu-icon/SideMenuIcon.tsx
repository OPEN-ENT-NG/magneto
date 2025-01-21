import React from "react";

import "./SideMenuIcon.scss";
import { Box } from "@mui/material";

interface SideMenuIconProps {
  icon: React.ReactNode;
  name: string;
  action: () => void;
}

export const SidemenuIcon: React.FC<SideMenuIconProps> = ({
  icon,
  name,
  action,
}) => {
  return (
    <>
      <Box
        role="button"
        className={`side-menu-icon`}
        onClick={action}
        tabIndex={0}
      >
        <Box className="side-menu-icon-img">{icon}</Box>
        {name && <span className="side-menu-icon-text">{name}</span>}
      </Box>
    </>
  );
};
