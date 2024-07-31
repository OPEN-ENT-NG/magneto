import { useTranslation } from "react-i18next";

import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { FolderTreeNavItem } from "~/models/folder-tree.model";

export const useInitialPublicFolderObject = () => {
  const { t } = useTranslation("magneto");
  const folderObject = new FolderTreeNavItem({
    id: FOLDER_TYPE.PUBLIC_BOARDS,
    title: t("magneto.lycee.connecte.boards"),
    parentId: "",
    section: true,
  });
  return folderObject;
};
