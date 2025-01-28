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

import { RightRole } from "@edifice.io/client";
import {
  checkUserRight,
  findPathById,
  TreeViewHandlers,
} from "@edifice.io/react";
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
    (nodeId: string, folderType: FOLDER_TYPE | BasicFolder) => {
      if (currentFolder.id === nodeId) return;

      setSelectedNodesIds((prevIds) => {
        let parentIds = [];

        // Si c'est un dossier principal
        if (Object.values(FOLDER_TYPE).includes(nodeId)) {
          parentIds = [nodeId];
        } else {
          // Pour les sous-dossiers, il faut déterminer le bon dossier racine
          const rootFolder = (() => {
            // Si le dossier est dans la corbeille
            const folder = folderData.find((f) => f.id === nodeId);
            if (folder?.deleted) {
              return FOLDER_TYPE.DELETED_BOARDS;
            }
            // Si c'est un dossier public
            if (folder?.isPublic) {
              return FOLDER_TYPE.PUBLIC_BOARDS;
            }
            // Par défaut, c'est un dossier privé
            return FOLDER_TYPE.MY_BOARDS;
          })();

          parentIds = [rootFolder, nodeId];
          const ancestorsPath = findPathById(folderData, nodeId);
          if (ancestorsPath.length > 0) {
            parentIds = [rootFolder, ...ancestorsPath, nodeId];
          }
        }

        return Array.from(new Set([...prevIds, ...parentIds]));
      });

      setCurrentFolder((prevFolder) => {
        if (prevFolder.id === nodeId) return prevFolder;

        const newFolder = prepareFolder(
          nodeId,
          folderData,
          t(prepareFolderTitle(folderType)),
        );

        handleFolderRefs(nodeId, folderType, folderData, folderNavigationRefs);

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
            (selectedResource: string) => selectedResource !== resource.id,
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
