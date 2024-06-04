import React, { useEffect, useState } from "react";

import { Card, useOdeClient } from "@edifice-ui/react";
import { mdiFolderPlus } from "@mdi/js";
import { Icon } from "@mui/material";

import "./FolderList.scss";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { Folder } from "~/models/folder.model";

type FolderListProps = {
    x: number;
    y: number;
    folder: {id: string, 
        title: string};
    areFoldersLoading: boolean;
    onSelect: (folder: Folder) => void;
};

export const FolderItem: React.FunctionComponent<FolderListProps> = ({
    x, 
    y,
    folder,
    areFoldersLoading,
    onSelect,
}) => {
  const { currentApp } = useOdeClient();
  const black = (x + y) % 2 === 1

  return (
    <>
      
                <Card
                  app={currentApp!}
                  options={{
                    type: "folder",
                    folder.title,
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
              
    </>
  );
};
