import React, { useEffect } from "react";

import { Button, SearchBar, TreeView, useToggle } from "@edifice-ui/react";
import { mdiFolderPlus, mdiStar } from "@mdi/js";
import { Icon } from "@mdi/react";
import { useTranslation } from "react-i18next";

import { SideBarButtons } from "./SideBarButtons";
import { FOLDER_TYPE } from "../../core/enums/folder-type.enum";
import { Folder, IFolderResponse } from "../../models/folder.model";
import { useGetFoldersQuery } from "../../services/api/folders.service";
import { BoardList } from "../board-list/BoardList";
import { FolderList } from "../folder-list/FolderList";
import ToasterContainer from "../toaster-container/ToasterContainer";
import { TreeViewContainer } from "../tree-view/TreeViewContainer";
import { useToaster } from "~/hooks/useToaster";
import {
  FolderTreeNavItem,
  IFolderTreeNavItem,
} from "~/models/folder-tree.model";

export const ContentPage = () => {
  const { t } = useTranslation();

  // const [isToasterOpen, toggleIsToasterOpen] = useToaster();

  return (
    <>
      <SearchBar
        isVariant
        onChange={function Ga() {}}
        onClick={function Ga() {}}
        placeholder="Search something...."
        size="md"
      />
      <FolderList />
      <ToasterContainer />
      <BoardList />
    </>
  );
};
