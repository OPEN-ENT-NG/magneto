import React, { useEffect, useState } from "react";

import { Card, useOdeClient } from "@edifice-ui/react";
import { mdiFolderPlus } from "@mdi/js";
import { Icon } from "@mui/material";

import "./FolderItem.scss";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { Folder } from "~/models/folder.model";
import { useDrop } from "react-dnd";

type FolderListProps = {
    folder: Folder;
    areFoldersLoading: boolean;
    onSelect: (folder: Folder) => void;
};

export const FolderItem: React.FunctionComponent<FolderListProps> = ({
    folder,
    areFoldersLoading,
    onSelect,
}) => {
  const { currentApp } = useOdeClient();

  const folderTitle = folder.title;

  const [, drop] = useDrop(
    () => ({
      accept: "board",
      drop: () => console.log("dropped")
    }),
  )

  return (
    <>
      <div ref={drop}>
        <Card
          app={currentApp!}
          options={{
            type: "folder",
            folderTitle,
          }}
          // onClick={() => {setIsToasterOpen()}}
          isLoading={areFoldersLoading}
          isSelectable={true}
          onClick={() => {
            onSelect(folder);
          }}
        >
          <Card.Body>
            <Icon path={mdiFolderPlus} size={1}></Icon>
            <Card.Title>{folder.title}</Card.Title>
          </Card.Body>
        </Card>
      </div>

              
    </>
  );
};
