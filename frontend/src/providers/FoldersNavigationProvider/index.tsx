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

import { checkUserRight, TreeViewHandlers } from "@edifice-ui/react";
import { RightRole } from "edifice-ts-client";
import { useTranslation } from "react-i18next";

import {
  BasicFolder,
  FolderNavigationRefs,
  FolderObjectState,
  FoldersNavigationContextType,
  FoldersNavigationProviderProps,
} from "./types";
import { useInitialCurrentFolder } from "./useInitialCurrentFolder";
import {
  BASIC_FOLDER,
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
  const [selectedFolderRights, setSelectedFolderRights] = useState<Record<
    RightRole,
    boolean
  > | null>(null);
  const [selectedNodesIds, setSelectedNodesIds] = useState<string[]>([
    FOLDER_TYPE.MY_BOARDS,
  ]);
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

  const handleFolderRefs = (
    folderId: string,
    folderType: FOLDER_TYPE | BasicFolder,
    folderData: Folder[],
    folderNavigationRefs: FolderNavigationRefs,
  ): void => {
    const determineRefAndId = (
      folderType: FOLDER_TYPE | BasicFolder,
    ): [React.RefObject<TreeViewHandlers> | undefined, string] => {
      if (folderType !== BASIC_FOLDER) {
        return [folderNavigationRefs[folderType as FOLDER_TYPE], folderId];
      }

      const parentFolder = folderData.find((folder) => folder.id === folderId);
      if (!parentFolder) return [undefined, folderId];

      const parentRef = parentFolder.deleted
        ? folderNavigationRefs[FOLDER_TYPE.DELETED_BOARDS]
        : folderNavigationRefs[FOLDER_TYPE.MY_BOARDS];

      return [parentRef, parentFolder.id || folderId];
    };

    const [targetRef, targetFolderId] = determineRefAndId(folderType);

    Object.entries(folderNavigationRefs).forEach(([type, ref]) => {
      if (
        type === folderType ||
        (folderType === BASIC_FOLDER && ref === targetRef)
      ) {
        ref.current?.select(targetFolderId);
      } else {
        ref.current?.unselectAll();
      }
    });
  };

  const handleSelect = useCallback(
    (folderId: string, folderType: FOLDER_TYPE | BasicFolder) => {
      if (currentFolder.id === folderId) return;

      setSelectedNodesIds((prevIds) => {
        if (
          prevIds.length === 1 &&
          prevIds[0] === FOLDER_TYPE.MY_BOARDS &&
          folderId ===
            (FOLDER_TYPE.DELETED_BOARDS || FOLDER_TYPE.DELETED_BOARDS)
        )
          return [folderId, ""];

        const preparePrevIds = prevIds.reduce((acc: string[], id: string) => {
          if (id !== "" && !acc.includes(id) && id !== folderId) {
            return [...acc, id];
          }
          return acc;
        }, []);

        return [...preparePrevIds, folderId, ""];
      });

      setCurrentFolder((prevFolder) => {
        if (prevFolder.id === folderId) return prevFolder;

        const newFolder = prepareFolder(
          folderId,
          folderData,
          t(prepareFolderTitle(folderType)),
        );

        handleFolderRefs(
          folderId,
          folderType,
          folderData,
          folderNavigationRefs,
        );

        return newFolder;
      });
    },
    [currentFolder.id, folderData, folderNavigationRefs, t],
  );

  const updateRights = async () => {
    setSelectedFolderRights(await checkUserRight(selectedFolders[0].rights));
  };

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
    if (selectedFolders.length === 1) updateRights();
    else setSelectedFolderRights(null);
  }, [selectedFolders]);

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
      selectedNodesIds,
      setSelectedNodesIds,
      handleFolderRefs,
      selectedFolderRights,
      setSelectedFolderRights,
    }),
    [
      currentFolder,
      folderData,
      folderObject,
      folders,
      selectedFolders,
      selectedFoldersIds,
      selectedNodesIds,
      folderNavigationRefs,
      toggleSelect,
      handleSelect,
      selectedFolderRights,
    ],
  );

  return (
    <FoldersNavigationContext.Provider value={value}>
      {children}
    </FoldersNavigationContext.Provider>
  );
};
