import React from "react";
import "./SideMenuIcon.scss";

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
      <div
        role="button"
        className={`side-menu-icon`}
        onClick={action}
        onKeyDown={action}
        tabIndex={0}
      >
        <div className="side-menu-icon-img">{icon}</div>
        {name && <span className="side-menu-icon-text">{name}</span>}
      </div>
    </>
  );
};
