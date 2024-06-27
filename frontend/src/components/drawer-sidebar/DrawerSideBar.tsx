import React from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";

import { SideBar } from "../side-bar/SideBar";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { Folder } from "~/models/folder.model";

type DrawerSideBarProps = {
  onSelect: (folder: Folder) => void;
  drawer: boolean;
  toggleDrawer: () => void;
};

export const DrawerSideBar: React.FunctionComponent<DrawerSideBarProps> = ({
  onSelect,
  drawer,
  toggleDrawer,
}) => {
  const {
    windowDimensions: { width },
  } = useWindowDimensions();
  return (
    <Drawer
      open={drawer}
      onClose={toggleDrawer}
      PaperProps={{
        sx: {
          height: width > 767 ? "calc(100% - 67px)" : "calc(100% - 28px)",
          top: width > 767 ? 67 : 43,
        },
      }}
    >
      <IconButton onClick={toggleDrawer}>
        <ChevronLeftIcon />
      </IconButton>
      <SideBar
        onSelect={onSelect}
        className="drawer"
        toggleDrawer={toggleDrawer}
      />
    </Drawer>
  );
};
