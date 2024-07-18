import {
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { TreeViewHandlers } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import {
  FolderNavigationRefs,
  FolderObjectState,
  FoldersNavigationContextType,
  FoldersNavigationProviderProps,
  TriggerFetchState,
} from "./types";
import { useInitialCurrentFolder } from "./useInitialCurrentFolder";
import {
  initialFolderObject,
  prepareFolder,
  prepareFoldersState,
  prepareFolderTitle,
  initialTriggerFetch,
} from "./utils";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { useGetFoldersQuery } from "~/services/api/folders.service";

const FoldersNavigationContext =
  createContext<FoldersNavigationContextType | null>(null);

export const useFoldersNavigation = () => {
  const context = useContext(FoldersNavigationContext);
  if (!context) {
    throw new Error(
      "useFoldersNavigation must be used within a FoldersNavigationProvider",
    );
  }
  return context;
};

export const FoldersNavigationProvider: FC<FoldersNavigationProviderProps> = ({
  children,
}) => {
  const [currentFolder, setCurrentFolder] = useState<Folder>(
    useInitialCurrentFolder(),
  );
  const [folderData, setFolderData] = useState<Folder[]>([]);
  const [folderObject, setFolderObject] =
    useState<FolderObjectState>(initialFolderObject);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [triggerFetch, setTriggerFetch] =
    useState<TriggerFetchState>(initialTriggerFetch);

  const myBoardsRef = useRef<TreeViewHandlers>(null);
  const publicBoardsRef = useRef<TreeViewHandlers>(null);
  const deletedBoardsRef = useRef<TreeViewHandlers>(null);
  const { t } = useTranslation("magneto");

  const folderNavigationRefs: FolderNavigationRefs = useMemo(
    () => ({
      [FOLDER_TYPE.MY_BOARDS]: myBoardsRef,
      [FOLDER_TYPE.PUBLIC_BOARDS]: publicBoardsRef,
      [FOLDER_TYPE.DELETED_BOARDS]: deletedBoardsRef,
    }),
    [],
  );

  const handleSelect = useCallback(
    (folderId: string, folderType: FOLDER_TYPE | "basicFolder") => {
      if (currentFolder.id === folderId) return;

      setCurrentFolder((prevFolder) => {
        if (prevFolder.id === folderId) return prevFolder;

        const newFolder = prepareFolder(
          folderId,
          folderData,
          t(prepareFolderTitle(folderType)),
        );

        setTimeout(() => {
          Object.entries(folderNavigationRefs).forEach(([type, ref]) => {
            if (type === folderType) {
              ref.current?.select(folderId);
            } else {
              ref.current?.unselectAll();
            }
          });
        }, 0);
        return newFolder;
      });
    },
    [currentFolder, folderData, folderNavigationRefs],
  );

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

        setFolderData((prevFolderData) => [
          ...prevFolderData,
          ...preparedFolders,
        ]);

        setFolderObject((prevFolderObject) => ({
          ...prevFolderObject,
          [folderType === FOLDER_TYPE.MY_BOARDS
            ? "myFolderObject"
            : "deletedFolderObject"]: folderObject,
        }));
      }
    },
    [t],
  );

  const { data: myFoldersResult } = useGetFoldersQuery(false, {
    skip: !triggerFetch.myFolders,
  });

  const { data: deletedFoldersResult } = useGetFoldersQuery(true, {
    skip: !triggerFetch.deletedFolders,
  });

  const getFolders = useCallback(() => {
    setFolderData([]);
    setTriggerFetch({ myFolders: true, deletedFolders: true });
  }, []);

  useEffect(() => {
    if (triggerFetch.myFolders && myFoldersResult) {
      processFolders(
        myFoldersResult,
        FOLDER_TYPE.MY_BOARDS,
        "magneto.my.boards",
      );
      setTriggerFetch((prev) => ({ ...prev, myFolders: false }));
    }
  }, [triggerFetch.myFolders, myFoldersResult, processFolders]);

  useEffect(() => {
    if (triggerFetch.deletedFolders && deletedFoldersResult) {
      processFolders(
        deletedFoldersResult,
        FOLDER_TYPE.DELETED_BOARDS,
        "magneto.trash",
      );
      setTriggerFetch((prev) => ({ ...prev, deletedFolders: false }));
    }
  }, [triggerFetch.deletedFolders, deletedFoldersResult, processFolders]);

  useEffect(() => {
    getFolders();
  }, [currentFolder]);

  useEffect(() => {
    if (folderData.length && currentFolder)
      setFolders(prepareFoldersState(folderData, currentFolder));
  }, [folderData, currentFolder]);

  const value = useMemo<FoldersNavigationContextType>(
    () => ({
      currentFolder,
      setCurrentFolder,
      folderData,
      setFolderData,
      folderObject,
      setFolderObject,
      folders,
      setFolders,
      getFolders,
      handleSelect,
      folderNavigationRefs,
    }),
    [
      currentFolder,
      folderData,
      folderObject,
      folders,
      folderNavigationRefs,
      getFolders,
      handleSelect,
    ],
  );

  return (
    <FoldersNavigationContext.Provider value={value}>
      {children}
    </FoldersNavigationContext.Provider>
  );
};
