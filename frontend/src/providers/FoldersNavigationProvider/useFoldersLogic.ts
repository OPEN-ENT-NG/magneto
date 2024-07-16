import { useState, useCallback, useEffect } from "react";

import { useTranslation } from "react-i18next";

import { FolderObjectState, TriggerFetchState } from "./types";
import { initialFolderObject, initialTriggerFetch } from "./utils";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { useGetFoldersQuery } from "~/services/api/folders.service";
import { useFoldersNavigation } from ".";

export const useFoldersLogic = () => {
  const { t } = useTranslation("magneto");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderObject, setFolderObject] =
    useState<FolderObjectState>(initialFolderObject);
  const [triggerFetch, setTriggerFetch]  =
    useState<TriggerFetchState>(initialTriggerFetch);
  const { myFolders, deletedFolders } = triggerFetch;
  const { currentFolder } = useFoldersNavigation();

  const processFolders = useCallback( //process sidebar folders
    (
      result: IFolderResponse[] | undefined,
      folderType: FOLDER_TYPE,
      title: string,
    ) => {
      if (result) {
        const preparedFolders = result.map((item) => new Folder().build(item));
        const folderObject = new FolderTreeNavItem({
          id: folderType,
          title: t(title),
          parentId: "",
          section: true,
        }).buildFolders(preparedFolders);

        setFolders((prevFolders) => [...prevFolders, ...preparedFolders]);

        setFolderObject((prevFolderObject) => ({
          ...prevFolderObject,
          [folderType === FOLDER_TYPE.MY_BOARDS
            ? "myFolderObject"
            : "deletedFolderObject"]: folderObject,
        }));
      }
    },
    [],
  );

  const filterDisplayedFolders = useCallback( //process folder list
    (
      folderData: Folder[] | undefined,
      currentFolder: Folder,
    ) => {
      if (folderData) {
        if (
          !currentFolder.id ||
          currentFolder.id == FOLDER_TYPE.MY_BOARDS ||
          currentFolder.id == FOLDER_TYPE.DELETED_BOARDS ||
          currentFolder.id == ""
        ) {
          setFolders(folderData.filter((folder: Folder) => !folder.parentId));
          console.log(folderData);
        } else if (currentFolder.id == FOLDER_TYPE.PUBLIC_BOARDS) {
          setFolders([]);
        } else if (!!currentFolder && !!currentFolder.id) {
          setFolders(folderData.filter(
            (folder: Folder) => folder.parentId == currentFolder.id
          ));
        } else {
          console.log("currentFolder undefined, try later or again");
        }
      }
    },
    [currentFolder, folders],
  )

  const { data: myFoldersResult } = useGetFoldersQuery(false, {
    skip: !myFolders,
  });

  const { data: deletedFoldersResult } = useGetFoldersQuery(true, {
    skip: !deletedFolders,
  });

  const getFolders = useCallback(() => {
    setFolders([]);
    setTriggerFetch({ myFolders: true, deletedFolders: true });
  }, []);

  useEffect(() => {
    if (myFolders && myFoldersResult) {
      processFolders(
        myFoldersResult,
        FOLDER_TYPE.MY_BOARDS,
        "magneto.my.boards",
      );
      setTriggerFetch({ ...triggerFetch, myFolders: false });
    }
  }, [myFolders, myFoldersResult, processFolders, triggerFetch]);

  useEffect(() => {
    if (deletedFolders && deletedFoldersResult) {
      processFolders(
        deletedFoldersResult,
        FOLDER_TYPE.DELETED_BOARDS,
        "magneto.trash",
      );
      setTriggerFetch({ ...triggerFetch, deletedFolders: false });
    }
  }, [deletedFolders, deletedFoldersResult, processFolders, triggerFetch]);

  return { folders, folderObject, getFolders, setFolders };
};
     