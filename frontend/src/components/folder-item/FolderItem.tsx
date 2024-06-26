import React, { useEffect, useState } from "react";

import { Card, useOdeClient } from "@edifice-ui/react";
import { mdiFolderPlus } from "@mdi/js";
import { Icon } from "@mui/material";

import "./FolderItem.scss";
import { Folder } from "~/models/folder.model";
import { useDrop } from "react-dnd";
import { useMoveBoardsMutation } from "~/services/api/boards.service";
import { Board } from "~/models/board.model";

type FolderListProps = {
    folder: Folder;
    areFoldersLoading: boolean;
    onSelect: (folder: Folder) => void;
    onDragAndDrop: (board: any) => void;
};

export const FolderItem: React.FunctionComponent<FolderListProps> = ({
    folder,
    areFoldersLoading,
    onSelect,
    onDragAndDrop
}) => {
  const { currentApp } = useOdeClient();
  const [moveBoardsToFolder] = useMoveBoardsMutation();

  const folderTitle = folder.title;

  const [, drop] = useDrop(
    () => ({
      accept: "board",
      drop: (item: any) => {
        console.log("dropped", item.board);

      moveBoardsToFolder({boardId: item.board.id, folderId: folder.id});

        onDragAndDrop(undefined);
      }
    }),
  )

  return (
    <>
      <div ref={drop} draggable="true">
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
