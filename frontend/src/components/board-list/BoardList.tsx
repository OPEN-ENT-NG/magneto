import React from "react";

import { Card, useOdeClient, ActionBar } from "@edifice-ui/react";
import {  animated, useSpring } from "@react-spring/web";

import { useToaster } from "../../hooks/useToaster"

import "./BoardList.scss";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { IFolder } from "edifice-ts-client";
import { useGetFoldersQuery } from "~/services/api/folders.service";
import { useGetBoardsQuery } from "~/services/api/boards.service";




export const BoardList = () => {
    const { currentApp } = useOdeClient();
    // const [isToasterOpen, setIsToasterOpen] = useToaster();

    const { data: myBoardsResult, isLoading: getBoardsLoading, error: getBoardsError } = useGetBoardsQuery({
        isPublic: false,
        isShared: true,
        isDeleted: false,
        searchText: '',
        sortBy: 'modificationDate',
        page: 0
    });
  
    let boardData;
    if (getBoardsError) {
      console.log("error");
    } else if (getBoardsLoading) {
      console.log("loading");
    } else {
      console.log("myBoardsResult", myBoardsResult);
      boardData = myBoardsResult.map(((folder: IFolderResponse) => new Folder().build(folder))); //convert folders to Board[]
    }

    const springs = useSpring({
        from: { opacity: 0 },
        to: { opacity: 1 },
      });
    

  return (
    <>
        {boardData?.length ? (
        <animated.ul className="grid ps-0 list-unstyled mb-24">
            {boardData.map((folder: Folder) => {
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
                                type: "board",
                                title,
                            }}
                            // onClick={() => {setIsToasterOpen()}}
                            isLoading={getBoardsLoading}
                            isSelectable={false}
                        >
                            <Card.Body>
                                <Card.Title>
                                {title}
                                </Card.Title>
                            </Card.Body>
                        </Card>
                    </animated.li>
                    
                )
            })}
        </animated.ul> 
        ) : null
        }

                    {/* <Card>
                        <Card.Body>
                            <Card.Title>
                            {boardData[0].title}
                            </Card.Title>
                        </Card.Body>
                    </Card> */}
        
        {false  ? (
            <animated.ul className="grid ps-0 list-unstyled mb-24">
            {data?.pages[0]?.folders.map((folder: IFolder) => {
                const { id, name } = folder;
                return (
                <animated.li
                    className="g-col-4 z-1"
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
                        name,
                    }}
                    isLoading={isFetching}
                    isSelected={folderIds.includes(folder.id)}
                    onOpen={() => {
                        scrollToTop();
                        openFolder({ folder, folderId: folder.id });
                    }}
                    onSelect={() => toggleSelect(folder)}
                    />
                </animated.li>
                );
            })}
            </animated.ul>
        ) 
        : 
        <div>coucou</div>}
    </>
  );
};
