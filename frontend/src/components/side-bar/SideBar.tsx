import React from "react";

import { SideBarButtons } from "./SideBarButtons";
import { FOLDER_TYPE } from "../../core/enums/folder-type.enum";
import { TreeViewContainer } from "../tree-view/TreeViewContainer";
import { Board } from "~/models/board.model";

type SideBarProps = {
  dragAndDropBoards: Board[];
  onDragAndDrop: (board: Board) => void;
  onSetShowModal: (show: boolean) => void;
  modalProps: any;
  onSetModalProps: (modalProps: any) => void;
  toggleDrawer?: () => void;
  className?: string;
};

export const SideBar: React.FunctionComponent<SideBarProps> = ({
  dragAndDropBoards,
  onDragAndDrop,
  onSetShowModal,
  modalProps,
  onSetModalProps,
  toggleDrawer,
  className,
}) => {
  const reducer = (
    state: { fileList: any[] },
    action: { type: any; dropDepth: any; inDropZone: any; files: any },
  ) => {
    switch (action.type) {
      case "SET_DROP_DEPTH":
        return { ...state, dropDepth: action.dropDepth };
      case "SET_IN_DROP_ZONE":
        return { ...state, inDropZone: action.inDropZone };
      case "ADD_FILE_TO_LIST":
        return { ...state, fileList: state.fileList.concat(action.files) };
      default:
        return state;
    }
  };

  const [data, dispatch] = React.useReducer(reducer, {
    dropDepth: 0,
    inDropZone: false,
    fileList: [],
  });

  return (
    <>
      <aside
        className={
          "g-col-3 g-col-lg-2 g-col-xl-3 border-end pt-16 pe-16 d-lg-block " +
          className
        }
      >
        <TreeViewContainer
          folderType={FOLDER_TYPE.MY_BOARDS}
          data={data}
          dispatch={dispatch}
          dragAndDropBoards={dragAndDropBoards}
          onDragAndDrop={onDragAndDrop}
          onDisplayModal={onSetShowModal}
          modalData={modalProps}
          onSetModalData={onSetModalProps}
        />
        <TreeViewContainer
          folderType={FOLDER_TYPE.PUBLIC_BOARDS}
          data={data}
          dispatch={dispatch}
          dragAndDropBoards={dragAndDropBoards}
          onDragAndDrop={onDragAndDrop}
          onDisplayModal={onSetShowModal}
          modalData={modalProps}
          onSetModalData={onSetModalProps}
        />
        <TreeViewContainer
          folderType={FOLDER_TYPE.DELETED_BOARDS}
          data={data}
          dispatch={dispatch}
          dragAndDropBoards={dragAndDropBoards}
          onDragAndDrop={onDragAndDrop}
          onDisplayModal={onSetShowModal}
          modalData={modalProps}
          onSetModalData={onSetModalProps}
        />
        <SideBarButtons toggleDrawer={toggleDrawer} />
      </aside>
    </>
  );
};
