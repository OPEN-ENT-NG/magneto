import React, { useEffect } from "react";

import {  Button, SearchBar, TreeView, useToggle } from "@edifice-ui/react";
import { Icon } from '@mdi/react';
import { mdiFolderPlus, mdiStar } from '@mdi/js';
import { useTranslation } from "react-i18next";
import { SideBarButtons } from "./SideBarButtons";
import { TreeViewContainer } from "../tree-view/TreeViewContainer";
import { FOLDER_TYPE } from "../../core/enums/folder-type.enum";
import { useGetFoldersQuery } from "../../services/api/folders.service";
import { Folder, IFolderResponse } from "../../models/folder.model";
import { FolderTreeNavItem, IFolderTreeNavItem } from "~/models/folder-tree.model";
import { FolderList } from "../folder-list/FolderList";
import ToasterContainer from "../toaster-container/ToasterContainer";
import { useToaster } from "~/hooks/useToaster";
import { BoardList } from "../board-list/BoardList";



  export const ContentPage = () => {
  const { t } = useTranslation();

  // const [isToasterOpen, toggleIsToasterOpen] = useToaster();


  return (
    <>
          <SearchBar
            isVariant
            onChange={function Ga(){}}
            onClick={function Ga(){}}
            placeholder="Search something...."
            size="md"
          />
          <FolderList />
          <ToasterContainer />
          <BoardList />

    </>
  );
};
