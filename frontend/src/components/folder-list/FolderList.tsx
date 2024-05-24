import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Card, useOdeClient, ActionBar } from "@edifice-ui/react";
import {  animated, useSpring } from "@react-spring/web";


import "./FolderList.scss";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { useGetFoldersQuery } from "~/services/api/folders.service";
import { mdiFolderPlus } from "@mdi/js";
import { Icon } from "@mui/material";




export const FolderList = (currentFolder: Folder, onSelect: (folder: Folder) => void) => {
    const { currentApp } = useOdeClient();
    // const [isToasterOpen, setIsToasterOpen] = useToaster();
    

    const { data: myFoldersResult, isLoading: getFoldersLoading, error: getFoldersError } = useGetFoldersQuery(false);
    const { data: deletedFoldersResult, isLoading: getDeletedFoldersLoading, error: getDeletedFoldersError } = useGetFoldersQuery(true);

    const filterFolderData = (): void => {
        if (!currentFolder.id || currentFolder.id == "my-boards" || currentFolder.id == "") {
            folderData = folderData.filter((folder: Folder) => !folder.parentId);
        } else if (!!currentFolder && !!currentFolder.id) { 
            folderData = folderData.filter((folder: Folder) => folder.parentId == currentFolder.id);
        } else {
            console.log("currentFolder undefined, try later or again");
        }
    }

    let folderData: Folder[];
    let deletedFolders;
    if (getFoldersError || getDeletedFoldersError) {
        console.log("error");
    } else if (getFoldersLoading || getDeletedFoldersLoading) {
        console.log("loading");
    } else {
        console.log("myFoldersResult", myFoldersResult);
        folderData = myFoldersResult.map(((folder: IFolderResponse) => new Folder().build(folder))); //convert folders to Folder[]
        filterFolderData();
        console.log("folderData", folderData);
        deletedFolders = deletedFoldersResult.map(((folder: IFolderResponse) => new Folder().build(folder)));
    }

  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  useEffect(() => {
      if (myFoldersResult) filterFolderData();
  }, [currentFolder]);



  return (
    <>
      {folderData?.length ? (
        <animated.ul className="grid ps-0 list-unstyled mb-24">
<<<<<<< HEAD
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
<<<<<<< HEAD
                  isLoading={getFoldersLoading}
=======
                  isLoading={getFoldersLoading || getDeletedFoldersLoading}
>>>>>>> feat(react): #MAG-391 display magneto elements (#181)
                  isSelectable={false}
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
=======
            {folderData.map((folder: Folder) => {
                const { id, title } = folder;
                return(
                    <animated.li
                        className="g-col-4 z-1 folderSizing"
                        key={id}
                        style={{
                        position: "relative",
                        ...springs
                        }}
                    >
                        <Card
                            app={currentApp!}
                            options={{
                                type: "folder",
                                title,
                            }}
                            // onClick={() => {setIsToasterOpen()}}
                            isLoading={getFoldersLoading || getDeletedFoldersLoading}
                            onClick={() => {onSelect(folder)}}
                        >
                            <Card.Body>
                                <Icon path={mdiFolderPlus} size={1}></Icon>
                                <Card.Title>
                                {title}
                                </Card.Title>
                            </Card.Body>
                        </Card>
                    </animated.li>
                    
                )
            })}
        </animated.ul> 
        ) : null}
>>>>>>> 424
    </>
  );
};
