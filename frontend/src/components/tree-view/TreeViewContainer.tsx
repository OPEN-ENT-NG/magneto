import React from "react";

import {  Button, TreeView } from "@edifice-ui/react";
import { useSelector } from "react-redux";
// import * as MaterialDesign from "react-icons/md";

interface FolderTreeNavItem {
  id: string;
  name: string;
  iconClass: string;
  children: Array<FolderTreeNavItem>;
  parentId: string;
  isOpened: boolean;
  ownerId: string;
  shared: any[];
}

//export const TreeViewContainer: React.FC<FolderTreeNavItem> = ({ id, name, iconClass, children, parentId, isOpened, ownerId, shared }) => {
  export const TreeViewContainer = () => {
    const todos = useSelector(state => state.folderNavTrees);


    /**
     * Check if the folder has a children (or sub-children) with the given id
     * @param folderId Folder identifier
     */
    const childrenContainsId = (folderId: string): boolean => {
      return this.id == folderId
          || this.children.some((folder: FolderTreeNavItem) => folder.id === folderId
          || folder.childrenContainsId(folderId));
  }

  /**
   * Open all folders from the given children folder to the current folder
   * @param folderId Folder identifier
   */
  const openChildrenToId = (folderId: string): void => {
      if (this.childrenContainsId(folderId)) {
          this._isOpened = true;
          if (this.children) {
              this.children.forEach((folder: FolderTreeNavItem) => {
                  folder.openChildrenToId(folderId);
              });
          }
      }
  }

  /**
   * Populate/Update the children list from the given folder list
   * @param folders Folder list
   */
  const buildFolders = (folders: Array<FolderTreeNavItem>): FolderTreeNavItem => {
      let childrenFolders: Array<FolderTreeNavItem> =
          folders.filter((folder: FolderTreeNavItem) => folder.parentId === this._id);

      let newChildren: Array<FolderTreeNavItem> = [];

      childrenFolders.forEach((folder: FolderTreeNavItem) => {
          let childMatch: FolderTreeNavItem =
              this.children.find((f: FolderTreeNavItem) => f.id === folder.id && f.name === folder.title);

          if (childMatch === undefined) {
              newChildren.push(new FolderTreeNavItem(folder).buildFolders(folders));
          } else {
              newChildren.push(childMatch.buildFolders(folders));
          }
      });

      this.children = newChildren;

      return this;
  }


  let dataTree = {
    children: [
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    id: "12",
                    name: "level 4 arborescence tree",
                  },
                  {
                    id: "13",
                    name: "nul james",
                  },
                ],
                id: "8",
                name: "level 3 arborescence tree",
              },
              {
                id: "9",
                name: "level 3 arborescence tree",
              },
            ],
            id: "4",
            name: "level 2 arborescence tree",
          },
          {
            children: [
              {
                id: "10",
                name: "level 3 arborescence tree",
              },
              {
                id: "11",
                name: "level 3 arborescence tree",
              },
            ],
            id: "5",
            name: "level 2 arborescence tree",
          },
        ],
        id: "1",
        name: "level 1 arborescence tree",
      },
      {
        children: [
          {
            id: "6",
            name: "level 2 arborescence tree",
          },
          {
            id: "7",
            name: "level 2 arborescence tree",
          },
        ],
        id: "2",
        name: "level 1 arborescence tree",
      },
      {
        id: "3",
        name: "level 1 arborescence tree",
      },
    ],
    id: "root",
    name: "Section Element",
    section: true,
  };





  return (
    <>
      <TreeView
        data={folderNavTrees}
        onTreeItemBlur={function Ga() {}}
        onTreeItemFocus={function Ga() {}}
        onTreeItemFold={function Ga() {}}
        onTreeItemSelect={function Ga() {}}
        onTreeItemUnfold={function Ga() {}}
      />
      <Button
        type={'button'}
      /**
       * `primary`, `secondary`, `tertiary` or `danger`
       */
      color={'secondary'}
      /**
       * `filled`, `outline` or `ghost`
       */
      variant={'outline'}
      /**
       * `sm`, `md` or `lg`
       */
      size={'sm'}
      /**
       * Does it has a text ?
       */
      children={'Créer un dossier'}
      /**
       * Display Icon Component to the left
       */
      // leftIcon={<MaterialDesign.MdHelp />}
    
      /**
       * Is it loading ?
       */
      isLoading={false}
      ></Button>
      <br/>
      <Button
        type={'button'}
      /**
       * `primary`, `secondary`, `tertiary` or `danger`
       */
      color={'secondary'}
      /**
       * `filled`, `outline` or `ghost`
       */
      variant={'outline'}
      /**
       * `sm`, `md` or `lg`
       */
      size={'sm'}
      /**
       * Does it has a text ?
       */
      children={'Afficher mes aimants favoris'}
      /**
       * Display Icon Component to the left
       */
      // leftIcon={<i></i>}
    
      /**
       * Is it loading ?
       */
      isLoading={false}
      ></Button>

    </>
  );
};
