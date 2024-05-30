import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Card, useOdeClient, ActionBar } from "@edifice-ui/react";
import {  animated, useSpring } from "@react-spring/web";


import "./FolderList.scss";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { useGetFoldersQuery } from "~/services/api/folders.service";
import { mdiFolderPlus } from "@mdi/js";
import { Icon } from "@mui/material";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";

type FolderListProps = {
  currentFolder: Folder;
  onSelect: (folder: Folder) => void;
}

export const FolderList: React.FunctionComponent<FolderListProps> = ({ currentFolder, onSelect }) => {
    const { currentApp } = useOdeClient();
    // const [isToasterOpen, setIsToasterOpen] = useToaster();
    const [foldersQuery, setFoldersQuery] = useState<boolean>(false);
    

    const { data: myFoldersResult, isLoading: getFoldersLoading, error: getFoldersError } = useGetFoldersQuery(foldersQuery);

    const filterFolderData = (): void => {
        if (!currentFolder.id || currentFolder.id == FOLDER_TYPE.MY_BOARDS || currentFolder.id == FOLDER_TYPE.DELETED_BOARDS || currentFolder.id == "") {
            folderData = folderData.filter((folder: Folder) => !folder.parentId);
        } else if (currentFolder.id == FOLDER_TYPE.PUBLIC_BOARDS) {
            folderData = [];
        } else if (!!currentFolder && !!currentFolder.id) {
            folderData = folderData.filter((folder: Folder) => folder.parentId == currentFolder.id);
        } else {
            console.log("currentFolder undefined, try later or again");
        }
    }

    let folderData: Folder[];
    if (getFoldersError) {
        console.log("error");
    } else if (getFoldersLoading ) {
        console.log("loading");
    } else {
        folderData = myFoldersResult.map(((folder: IFolderResponse) => new Folder().build(folder))); //convert folders to Folder[]
        filterFolderData();
    }

  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  useEffect(() => {
    setFoldersQuery(currentFolder.id == FOLDER_TYPE.DELETED_BOARDS || !!currentFolder.deleted);
  }, [currentFolder]);



  return (
    <>
      {folderData?.length ? (
        <animated.ul className="grid ps-0 list-unstyled mb-24">
          {folderData.map((folder: Folder) => {
            const { id, title } = folder;
            return (
              <animated.li
                className="g-col-4 z-1 folderSizing"
                key={id}
                style={{
                  position: "relative",
                  ...springs,
                }}
              >
                <Card
                  app={currentApp!}
                  options={{
                    type: "folder",
                    title,
                  }}
                  // onClick={() => {setIsToasterOpen()}}
                  isLoading={getFoldersLoading}
                  isSelectable={true}
                  onClick={() => {onSelect(folder)}}
                >
                  <Card.Body>
                    <Icon path={mdiFolderPlus} size={1}></Icon>
                    <Card.Title>{title}</Card.Title>
                  </Card.Body>
                </Card>
              </animated.li>
            );
          })}
        </animated.ul>
      ) : null}
    </>
  );
};
