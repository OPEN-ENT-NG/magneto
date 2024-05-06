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
import { useGetBoardsQuery } from "~/services/api/boards.service";
import { BoardList } from "../board-list/BoardList";



  export const ContentPage = () => {
  const { t } = useTranslation();

  // const [isToasterOpen, toggleIsToasterOpen] = useToaster();

  const { data: myBoardsResult, isLoading: getBoardsLoading, error: getBoardsError } = useGetBoardsQuery({
      isPublic: false,
      isShared: true,
      isDeleted: false,
      searchText: '',
      sortBy: 'modificationDate',
      page: 0
  });

  let myBoards;
  if (getBoardsError) {
    console.log("error");
  } else if (getBoardsLoading) {
    console.log("loading");
  } else {
    console.log(myBoardsResult);
    myBoards = myBoardsResult.map(((folder: IFolderResponse) => new Folder().build(folder))); //convert folders to Board[]
  }



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
