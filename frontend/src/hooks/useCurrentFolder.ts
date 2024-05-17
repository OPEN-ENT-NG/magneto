import { useEffect, useState } from "react";
import { Folder } from "~/models/folder.model";

export const useCurrentFolder = (folder: Folder) => {
    const [currentFolder, setCurrentFolder] = useState<Folder>(folder);
    // const [selectedFolders, setSelectedFolders] = useSelectedFolders();

    useEffect = {() => {
        setCurrentFolder(folder);
    }}

    return {
        currentFolder,
    };
}