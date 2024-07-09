import React from "react";

import { useTranslation } from "react-i18next";

import { SideBarButtons } from "./SideBarButtons";
import { FOLDER_TYPE } from "../../core/enums/folder-type.enum";
import { Folder, IFolderResponse } from "../../models/folder.model";
import { useGetFoldersQuery } from "../../services/api/folders.service";
import { TreeViewContainer } from "../tree-view/TreeViewContainer";
import { Board } from "~/models/board.model";
import { FolderTreeNavItem } from "~/models/folder-tree.model";

type SideBarProps = {
  onSelect: (folder: Folder) => void;
  dragAndDropBoards: Board[];
  onDragAndDrop: (board: Board) => void;
  onSetShowModal: (show: boolean) => void;
  modalProps: any;
  onSetModalProps: (modalProps: any) => void;
  toggleDrawer?: () => void;
  className?: string;
};

export const SideBar: React.FunctionComponent<SideBarProps> = ({
  onSelect,
  dragAndDropBoards,
  onDragAndDrop,
  onSetShowModal,
  modalProps,
  onSetModalProps,
  toggleDrawer,
  className,
}) => {
  const { t } = useTranslation();

  const {
    data: myFoldersResult,
    isLoading: getFoldersLoading,
    error: getFoldersError,
  } = useGetFoldersQuery(false);
  const {
    data: deletedFoldersResult,
    isLoading: getDeletedFoldersLoading,
    error: getDeletedFoldersError,
  } = useGetFoldersQuery(true);

  let myFolders: Folder[];
  let deletedFolders: Folder[];
  let myFoldersObject: FolderTreeNavItem;
  let deletedFoldersObject: FolderTreeNavItem;

  if (getFoldersError || getDeletedFoldersError) {
    console.log("error");
  } else if (getFoldersLoading || getDeletedFoldersLoading) {
    console.log("loading");
  } else {
    myFolders = myFoldersResult.map((folder: IFolderResponse) =>
      new Folder().build(folder),
    ); //convert folders to Folder[]
    deletedFolders = deletedFoldersResult.map((folder: IFolderResponse) =>
      new Folder().build(folder),
    );

    myFoldersObject = new FolderTreeNavItem(
      {
        id: FOLDER_TYPE.MY_BOARDS,
        title: t("magneto.my.boards"),
        parentId: "",
        section: true,
      },
      false,
      "magneto-check-decagram",
    ).buildFolders(myFolders);
    deletedFoldersObject = new FolderTreeNavItem(
      {
        id: FOLDER_TYPE.DELETED_BOARDS,
        title: t("magneto.trash"),
        parentId: "",
        section: true,
        deleted: true,
      },
      false,
      "magneto.trash",
    ).buildFolders(deletedFolders);
  }

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
          folders={myFolders ?? []}
          folderObject={myFoldersObject ?? undefined}
          folderType={FOLDER_TYPE.MY_BOARDS}
          onSelect={(folder) => {
            onSelect(folder);
            if (toggleDrawer != null) toggleDrawer();
          }}
          data={data}
          dispatch={dispatch}
          dragAndDropBoards={dragAndDropBoards}
          onDragAndDrop={onDragAndDrop}
          onDisplayModal={onSetShowModal}
          modalData={modalProps}
          onSetModalData={onSetModalProps}
        />
        <TreeViewContainer
          folders={myFolders ?? []}
          folderObject={{
            children: [],
            id: FOLDER_TYPE.PUBLIC_BOARDS,
            name: t("magneto.lycee.connecte.boards"),
            section: true,
            isPublic: true,
          }}
          folderType={FOLDER_TYPE.MY_BOARDS}
          onSelect={(folder) => {
            onSelect(folder);
            if (toggleDrawer != null) toggleDrawer();
          }}
          data={data}
          dispatch={dispatch}
          dragAndDropBoards={dragAndDropBoards}
          onDragAndDrop={onDragAndDrop}
          onDisplayModal={onSetShowModal}
          modalData={modalProps}
          onSetModalData={onSetModalProps}
        />
        <TreeViewContainer
          folders={deletedFolders}
          folderObject={deletedFoldersObject}
          folderType={FOLDER_TYPE.DELETED_BOARDS}
          onSelect={(folder) => {
            onSelect(folder);
            if (toggleDrawer != null) toggleDrawer();
          }}
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
