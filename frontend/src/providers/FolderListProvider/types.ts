import { Dispatch, ReactNode, SetStateAction } from "react";
import { Folder } from "~/models/folder.model";


export interface ModalProviderProviderProps {
  children: ReactNode;
}



export type FolderListProviderContextType = {
    folders: Folder[];
    setFolders: Dispatch<SetStateAction<Folder[]>>;

};