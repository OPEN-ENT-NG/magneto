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
} from "./types";
import { useInitialCurrentFolder } from "./useInitialCurrentFolder";
import {
  initialFolderObject,
  prepareFolder,
  prepareFoldersState,
  prepareFolderTitle,
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
  const [selectedFolders, setSelectedFolders] = useState<Folder[]>([]);
  const [selectedFoldersIds, setSelectedFoldersIds] = useState<string[]>([]);
  const { currentData: myBoardsData } = useGetFoldersQuery(false);
  const { currentData: deletedBoardsData } = useGetFoldersQuery(true);

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
    [currentFolder.id, folderData, folderNavigationRefs, t],
  );

  const toggleSelect = useCallback(
    (resource: Folder) => {
      if (selectedFoldersIds.includes(resource.id)) {
        setSelectedFoldersIds(
          selectedFoldersIds.filter(
            (selectedResource: String) => selectedResource !== resource.id,
          ),
        );
        setSelectedFolders(
          selectedFolders.filter(
            (selectedResource) => selectedResource.id !== resource.id,
          ),
        );
        return;
      }
      setSelectedFoldersIds([...selectedFoldersIds, resource.id]);
      setSelectedFolders([...selectedFolders, resource]);
    },
    [selectedFolders, selectedFoldersIds],
  );

  useEffect(() => {
    if (myBoardsData && deletedBoardsData) {
      const allFolders = [
        ...myBoardsData.map((item: IFolderResponse) =>
          new Folder().build(item),
        ),
        ...deletedBoardsData.map((item: IFolderResponse) =>
          new Folder().build(item),
        ),
      ];
      setFolderData(allFolders);

      const myFolderObject = new FolderTreeNavItem({
        id: FOLDER_TYPE.MY_BOARDS,
        title: t("magneto.my.boards"),
        parentId: "",
        section: true,
      }).buildFolders(allFolders);

      const deletedFolderObject = new FolderTreeNavItem({
        id: FOLDER_TYPE.DELETED_BOARDS,
        title: t("magneto.trash"),
        parentId: "",
        section: true,
      }).buildFolders(allFolders);

      setFolderObject({ myFolderObject, deletedFolderObject });
    }
  }, [myBoardsData, deletedBoardsData, t]);

  useEffect(() => {
    if (folderData.length && currentFolder) {
      setFolders(prepareFoldersState(folderData, currentFolder));
    }
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
      selectedFolders,
      setSelectedFolders,
      selectedFoldersIds,
      setSelectedFoldersIds,
      toggleSelect,
      handleSelect,
      folderNavigationRefs,
    }),
    [
      currentFolder,
      folderData,
      folderObject,
      folders,
      selectedFolders,
      selectedFoldersIds,
      folderNavigationRefs,
      toggleSelect,
      handleSelect,
    ],
  );

  return (
    <FoldersNavigationContext.Provider value={value}>
      {children}
    </FoldersNavigationContext.Provider>
  );
};
