import { useState, useCallback, useEffect } from "react";

import { useTranslation } from "react-i18next";

import { FolderObjectState, TriggerFetchState } from "./types";
import { initialFolderObject, initialTriggerFetch } from "./utils";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { useGetFoldersQuery } from "~/services/api/folders.service";

export const useFoldersLogic = () => {
  const { t } = useTranslation("magneto");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderObject, setFolderObject] =
    useState<FolderObjectState>(initialFolderObject);
  const [triggerFetch, setTriggerFetch] =
    useState<TriggerFetchState>(initialTriggerFetch);
  const { myFolders, deletedFolders } = triggerFetch;

  const processFolders = useCallback(
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

  return { folders, folderObject, getFolders };
};
