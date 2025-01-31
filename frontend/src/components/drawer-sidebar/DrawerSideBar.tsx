import React from "react";

import CloseIcon from "@mui/icons-material/Close";
import Drawer from "@mui/material/Drawer";
import "./style.scss";
import IconButton from "@mui/material/IconButton";

import { SideBar } from "../side-bar/SideBar";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { Board } from "~/models/board.model";

type DrawerSideBarProps = {
  drawer: boolean;
  dragAndDropBoards: Board[];
  onDragAndDrop: (board: Board) => void;
  onSetShowModal: (show: boolean) => void;
  modalProps: any;
  onSetModalProps: (modalProps: any) => void;
  toggleDrawer?: () => void;
  className?: string;
};

export const DrawerSideBar: React.FunctionComponent<DrawerSideBarProps> = ({
  drawer,
  toggleDrawer,
  dragAndDropBoards,
  onDragAndDrop,
  onSetShowModal,
  modalProps,
  onSetModalProps,
}) => {
  const { width } = useWindowDimensions();
  return (
    <Drawer
      open={drawer}
      onClose={toggleDrawer}
      PaperProps={{
        sx: {
          height: width > 767 ? "calc(100% - 67px)" : "calc(100% - 28px)", //size (and place just the line under) the drawer so it starts just under the ENT header (which changes at 768px)
          top: width > 767 ? 67 : 43,
        },
      }}
    >
      <div className="button-wrapper">
        <IconButton onClick={toggleDrawer}>
          <CloseIcon
            fontSize="large"
            style={{ color: "var(--edifice-secondary)" }}
          />
        </IconButton>
      </div>
      <SideBar
        className="drawer"
        toggleDrawer={toggleDrawer}
        dragAndDropBoards={dragAndDropBoards}
        onDragAndDrop={onDragAndDrop}
        onSetShowModal={onSetShowModal}
        modalProps={modalProps}
        onSetModalProps={onSetModalProps}
      />
    </Drawer>
  );
};
