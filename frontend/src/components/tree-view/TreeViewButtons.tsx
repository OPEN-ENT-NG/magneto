import React from "react";

import { Add, AddUser, Folder, Plus, Save } from "@edifice-ui/icons";
import { Button, TreeView } from "@edifice-ui/react";
import { Icon } from "@mdi/react";
import { mdiFolderPlus, mdiStar } from "@mdi/js";
import { useTranslation } from "react-i18next";

export const TreeViewButtons = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="d-grid my-16">
        <Button
          type={"button"}
          color={"secondary"}
          variant={"outline"}
          size={"sm"}
          children={t("magneto.create.folder")}
          leftIcon={<Icon path={mdiFolderPlus} size={1}></Icon>}
          isLoading={false}
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
      </div>
    </>
  );
};
