import { useTranslation } from "react-i18next";

import { usePredefinedToasts } from "./usePredefinedToasts";
import { useRestorePreDeleteBoardsMutation } from "~/services/api/boards.service";
import { useRestorePreDeleteFoldersMutation } from "~/services/api/folders.service";

interface useRestoreBoardsAndFoldersProps {
  selectedBoardsIds: string[];
  selectedFoldersIds: string[];
}

export const useRestoreBoardsAndFolders = ({
  selectedBoardsIds,
  selectedFoldersIds,
}: useRestoreBoardsAndFoldersProps) => {
  const { t } = useTranslation("magneto");
  const [restorePreDeleteBoards] = useRestorePreDeleteBoardsMutation();
  const [restorePreDeleteFolders] = useRestorePreDeleteFoldersMutation();

  const restorePreDeleteBoardsToast = usePredefinedToasts({
    func: restorePreDeleteBoards,
    successMessage: t("magneto.restore.elements.confirm"),
    failureMessage: t("magneto.restore.elements.error"),
  });

  const restorePreDeleteFoldersToast = usePredefinedToasts({
    func: restorePreDeleteFolders,
    successMessage: t("magneto.restore.elements.confirm"),
    failureMessage: t("magneto.restore.elements.error"),
  });

  const restoreBoardsAndFolders = async () => {
    if (selectedBoardsIds.length > 0) {
      await restorePreDeleteBoardsToast(selectedBoardsIds);
    }
    if (selectedFoldersIds.length > 0) {
      await restorePreDeleteFoldersToast(selectedFoldersIds);
    }
  };

  return restoreBoardsAndFolders;
};
