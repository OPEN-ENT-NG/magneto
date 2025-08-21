import { useTranslation } from "react-i18next";

import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { FolderTreeNavItem } from "~/models/folder-tree.model";

export const useInitialDeletedBoardsFolderObject = () => {
  const { t } = useTranslation("magneto");
  const folderObject = new FolderTreeNavItem({
    id: FOLDER_TYPE.DELETED_BOARDS,
    title: t("magneto.trash"),
    parentId: "",
    section: true,
  });
  return folderObject;
};
