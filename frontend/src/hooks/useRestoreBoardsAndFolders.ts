import { useTranslation } from "react-i18next";

import { usePredefinedToasts } from "./usePredefinedToasts";
import { useRestorePreDeleteBoardsMutation } from "~/services/api/boards.service";
import { useRestorePreDeleteFoldersMutation } from "~/services/api/folders.service";

interface useRestoreBoardsAndFoldersProps {
  selectedBoardIds: string[];
  selectedFolderIds: string[];
}

export const useRestoreBoardsAndFolders = ({
  selectedBoardIds,
  selectedFolderIds,
}: useRestoreBoardsAndFoldersProps) => {
  const { t } = useTranslation("magneto");
  const [restorePreDeleteBoards] = useRestorePreDeleteBoardsMutation();
  const [restorePreDeleteFolders] = useRestorePreDeleteFoldersMutation();

  const restorePreDeleteBoardsToast = usePredefinedToasts({
    func: restorePreDeleteBoards,
    parameter: selectedBoardIds,
    successMessage: t("magneto.restore.elements.confirm"),
    failureMessage: t("magneto.restore.elements.error"),
  });

  const restorePreDeleteFoldersToast = usePredefinedToasts({
    func: restorePreDeleteFolders,
    parameter: selectedFolderIds,
    successMessage: t("magneto.restore.elements.confirm"),
    failureMessage: t("magneto.restore.elements.error"),
  });

  const restoreBoardsAndFolders = async () => {
    if (selectedBoardIds.length > 0) {
      await restorePreDeleteBoardsToast();
    }
    if (selectedFolderIds.length > 0) {
      await restorePreDeleteFoldersToast();
    }
  };

  return restoreBoardsAndFolders;
};
