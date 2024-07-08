import React, { useEffect } from "react";

import { SideBarButtons } from "./SideBarButtons";
import { FOLDER_TYPE } from "../../core/enums/folder-type.enum";
import { Folder } from "../../models/folder.model";
import { TreeViewContainer } from "../tree-view/TreeViewContainer";
import { useFoldersNavigation } from "~/providers/FoldersNavigationProvider";

type SideBarProps = {
  onSelect: (folder: Folder) => void;
  toggleDrawer?: () => void;
  className?: string;
};

export const SideBar: React.FunctionComponent<SideBarProps> = ({
  onSelect,
  toggleDrawer,
  className,
}) => {
  const { getFolders } = useFoldersNavigation();

  useEffect(() => { getFolders() }, []);

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
          onSelect={(folder) => {
            onSelect(folder);
            if (toggleDrawer != null) toggleDrawer();
          }}
        />
        <TreeViewContainer
          folderType={FOLDER_TYPE.PUBLIC_BOARDS}
          onSelect={(folder) => {
            onSelect(folder);
            if (toggleDrawer != null) toggleDrawer();
          }}
        />
        <TreeViewContainer
          folderType={FOLDER_TYPE.DELETED_BOARDS}
          onSelect={(folder) => {
            onSelect(folder);
            if (toggleDrawer != null) toggleDrawer();
          }}
        />
        <SideBarButtons toggleDrawer={toggleDrawer} />
      </aside>
    </>
  );
};
