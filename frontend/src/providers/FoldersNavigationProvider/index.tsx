import {
  FC,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { TreeViewHandlers } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import {
  FolderNavigationRefs,
  FoldersNavigationContextType,
  FoldersNavigationProviderProps,
} from "./types";
import { useFoldersLogic } from "./useFoldersLogic";
import { useInitialCurrentFolder } from "./useInitialCurrentFolder";
import { prepareFolder, prepareFolderTitle } from "./utils";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { Folder } from "~/models/folder.model";

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
  const { folders, folderObject, getFolders } = useFoldersLogic();
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
          folders,
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
    [currentFolder, folders, folderNavigationRefs],
  );

  const value = useMemo<FoldersNavigationContextType>(
    () => ({
      currentFolder,
      setCurrentFolder,
      folders,
      folderObject,
      getFolders,
      handleSelect,
      folderNavigationRefs,
    }),
    [currentFolder, folders, folderObject, folderNavigationRefs],
  );

  return (
    <FoldersNavigationContext.Provider value={value}>
      {children}
    </FoldersNavigationContext.Provider>
  );
};
