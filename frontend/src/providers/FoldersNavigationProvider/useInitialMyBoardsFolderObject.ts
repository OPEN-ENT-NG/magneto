import { useTranslation } from "react-i18next";

import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { FolderTreeNavItem } from "~/models/folder-tree.model";

export const useInitialMyBoardsFolderObject = () => {
  const { t } = useTranslation("magneto");
  const folderObject = new FolderTreeNavItem({
    id: FOLDER_TYPE.MY_BOARDS,
    title: t("magneto.my.boards"),
    parentId: "",
    section: true,
  });
  return folderObject;
};
