import React from "react";

import { Button, useToggle } from "@edifice-ui/react";
import { mdiFolderPlus, mdiStar } from "@mdi/js";
import { Icon } from "@mdi/react";
import { useTranslation } from "react-i18next";

import { CreateFolder } from "../create-folder/CreateFolder";

export const TreeViewButtons = () => {
  const { t } = useTranslation();

  const [isCreateFolderOpen, toggleCreateFolderOpen] = useToggle(false);

  return (
    <>
      <div className="d-grid my-16">
        <Button
          type={"button"}
          color={"secondary"}
          variant={"outline"}
          size={"sm"}
          children={t("magneto.create.folder")}
          isLoading={false}
          onClick={toggleCreateFolderOpen}
          leftIcon={<Icon path={mdiFolderPlus} size={1}></Icon>}
        ></Button>
        <br />
        <Button
          type={"button"}
          color={"secondary"}
          variant={"outline"}
          size={"sm"}
          children={"Afficher mes aimants favoris"}
          leftIcon={<Icon path={mdiStar} size={1}></Icon>}
          isLoading={false}
        ></Button>
        <CreateFolder
          isOpen={isCreateFolderOpen}
          toggle={toggleCreateFolderOpen}
        />
      </div>
    </>
  );
};
