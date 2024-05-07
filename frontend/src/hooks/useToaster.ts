import { useState } from "react";
import { useSelectedFolders } from "./useSelectedFolders";

export const useToaster = () => {
    const [isToasterOpen, setIsToasterOpen] = useState<boolean>(false);
    // const [selectedFolders, setSelectedFolders] = useSelectedFolders();

    const toasterDisplay = () => {
        setIsToasterOpen(!isToasterOpen);
    }

    return {
        toasterDisplay,
    };
}