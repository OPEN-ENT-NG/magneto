import {
  FC,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FoldersNavigationContextType,
  FoldersNavigationProviderProps,
} from "./types";
import { useFoldersLogic } from "./useFoldersLogic";
import { initialCurrentFolder } from "./utils";
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
  const [currentFolder, setCurrentFolder] =
    useState<Folder>(initialCurrentFolder);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([""]);
  const { folders, folderObject, getFolders } = useFoldersLogic();

  useEffect(() => {
    setSelectedNodeIds((prevState) => {
      return [
        ...prevState.slice(0, -1).filter((item) => item !== currentFolder.id),
        currentFolder.id,
      ];
    });
  }, [currentFolder]);

  const value = useMemo<FoldersNavigationContextType>(
    () => ({
      currentFolder,
      setCurrentFolder,
      selectedNodeIds,
      setSelectedNodeIds,
      folders,
      folderObject,
      getFolders,
    }),
    [currentFolder, selectedNodeIds, folders, folderObject, getFolders],
  );

  return (
    <FoldersNavigationContext.Provider value={value}>
      {children}
    </FoldersNavigationContext.Provider>
  );
};
