import { t } from "i18next";

import { usePredefinedToasts } from "./usePredefinedToasts";
import { useRestorePreDeleteBoardsMutation } from "~/services/api/boards.service";
import { useRestorePreDeleteFoldersMutation } from "~/services/api/folders.service";



interface useRestoreBoardsAndFoldersProps {
    boardIds: String[];
    folderIds: String[];
}

export const useRestoreBoardsAndFolders = ({
    boardIds,
    folderIds,
}: useRestoreBoardsAndFoldersProps) => {

    const [restorePreDeleteBoards] = useRestorePreDeleteBoardsMutation();
    const [restorePreDeleteFolders] = useRestorePreDeleteFoldersMutation();

    const restorePreDeleteBoardsToast = usePredefinedToasts({
        func: restorePreDeleteBoards,
        parameter: boardIds,
        successMessage: t("magneto.restore.elements.confirm"),
        failureMessage: t("magneto.restore.elements.error"),
    });

    const restorePreDeleteFoldersToast = usePredefinedToasts({
        func: restorePreDeleteFolders,
        parameter: folderIds,
        successMessage: t("magneto.restore.elements.confirm"),
        failureMessage: t("magneto.restore.elements.error"),
    });

    const restoreBoardsAndFolders = async () => {
        if (boardIds.length > 0) {
            await restorePreDeleteBoardsToast();
        }
        if (folderIds.length > 0) {
            await restorePreDeleteFoldersToast();
        }
        //TODO reset all data
    };

    return restoreBoardsAndFolders;
};
