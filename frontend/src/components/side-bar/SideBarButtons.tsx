import React, { useEffect, useState } from "react";

import { Button, useOdeClient, useToggle } from "@edifice-ui/react";
import { mdiFolderPlus, mdiStar } from "@mdi/js";
import { Icon } from "@mdi/react";
import { useTranslation } from "react-i18next";

import { CreateFolder } from "../create-folder/CreateFolder";
import { MagnetsCollectionModal } from "../magnets-collection/MagnetsCollectionModal";

import "./SideBar.scss";
import { useFoldersNavigation } from "~/providers/FoldersNavigationProvider";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { folderHasShareRights } from "~/utils/share.utils";

type SideBarButtonsProps = {
  toggleDrawer: () => void;
};

export const SideBarButtons: React.FunctionComponent<SideBarButtonsProps> = ({
  toggleDrawer,
}) => {
  const { t } = useTranslation("magneto");

  const [isCreateFolderOpen, toggleCreateFolderOpen] = useToggle(false);
  const [isMagnetsCollectionOpen, toggleMagnetsCollectionOpen] = useToggle(false);
  const { user } = useOdeClient();
  const { currentFolder } = useFoldersNavigation();
  const [isFolderOwnerOrSharedWithRights, setIsFolderOwnerOrSharedWithRights] = useState<boolean>(false);
  
  useEffect(() => {
    setIsFolderOwnerOrSharedWithRights(currentFolder.id == FOLDER_TYPE.MY_BOARDS || currentFolder.ownerId === user?.userId || folderHasShareRights(currentFolder, "publish", user));
  }, [currentFolder]);

  return (
    <>
      <div className="d-grid my-16">
        {isFolderOwnerOrSharedWithRights && <Button
          type={"button"}
          color={"secondary"}
          variant={"outline"}
          size={"sm"}
          className="sideButtons"
          children={t("magneto.create.folder")}
          isLoading={false}
          onClick={toggleCreateFolderOpen}
          leftIcon={<Icon path={mdiFolderPlus} size={1}></Icon>}
        ></Button>}
        <Button
          type={"button"}
          color={"secondary"}
          variant={"outline"}
          size={"sm"}
          className="sideButtons"
          children={t("magneto.show.favorites")}
          leftIcon={<Icon path={mdiStar} size={1}></Icon>}
          isLoading={false}
          onClick={toggleMagnetsCollectionOpen}
        ></Button>
        <CreateFolder
          isOpen={isCreateFolderOpen}
          toggle={toggleCreateFolderOpen}
          toggleDrawer={toggleDrawer}
        />
        <MagnetsCollectionModal
          isOpen={isMagnetsCollectionOpen}
          toggle={toggleMagnetsCollectionOpen}
        />
      </div>
    </>
  );
};
