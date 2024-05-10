import React from "react";

import { Card, useOdeClient, ActionBar } from "@edifice-ui/react";
import {  animated, useSpring } from "@react-spring/web";

import { useToaster } from "../../hooks/useToaster"

import "./FolderList.scss";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { IFolder } from "edifice-ts-client";
import { useGetFoldersQuery } from "~/services/api/folders.service";
import { mdiFolderPlus } from "@mdi/js";
import { Icon } from "@mui/material";




export const FolderList = () => {
    const { currentApp } = useOdeClient();
    // const [isToasterOpen, setIsToasterOpen] = useToaster();

    const { data: myFoldersResult, isLoading: getFoldersLoading, error: getFoldersError } = useGetFoldersQuery(false);
    const { data: deletedFoldersResult, isLoading: getDeletedFoldersLoading, error: getDeletedFoldersError } = useGetFoldersQuery(true);

    let folderData;
    let deletedFolders;
    if (getFoldersError || getDeletedFoldersError) {
        console.log("error");
    } else if (getFoldersLoading || getDeletedFoldersLoading) {
        console.log("loading");
    } else {
        console.log("myFoldersResult", myFoldersResult);
        folderData = myFoldersResult.map(((folder: IFolderResponse) => new Folder().build(folder))); //convert folders to Folder[]
        deletedFolders = deletedFoldersResult.map(((folder: IFolderResponse) => new Folder().build(folder)));
    }

    const springs = useSpring({
        from: { opacity: 0 },
        to: { opacity: 1 },
      });
    

  return (
    <>
        {folderData?.length ? (
        <animated.ul className="grid ps-0 list-unstyled mb-24">
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
                            isSelectable={false}
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
    </>
  );
};
