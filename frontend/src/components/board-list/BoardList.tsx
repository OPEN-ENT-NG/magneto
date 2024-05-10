import React from "react";

import { Card, useOdeClient, ActionBar } from "@edifice-ui/react";
import {  animated, useSpring } from "@react-spring/web";

import { useToaster } from "../../hooks/useToaster"

import "./BoardList.scss";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { IFolder } from "edifice-ts-client";
import { useGetFoldersQuery } from "~/services/api/folders.service";
import { useGetBoardsQuery } from "~/services/api/boards.service";
import { Board, IBoardItemResponse, IBoardsResponse } from "~/models/board.model";
import { mdiAccountCircle, mdiCalendarBlank, mdiFolderPlus, mdiShareVariant, mdiStar } from "@mdi/js";
import { Icon } from "@mui/material";




export const BoardList = () => {
    const { currentApp } = useOdeClient();
    // const [isToasterOpen, setIsToasterOpen] = useToaster();

    const { data: myBoardsResult, isLoading: getBoardsLoading, error: getBoardsError } = useGetBoardsQuery({
        isPublic: false,
        isShared: true,
        isDeleted: false,
        sortBy: 'modificationDate',
        page: 0
    }) || {};
  
    let boardData;
    if (getBoardsError) {
      console.log("error");
    } else if (getBoardsLoading) {
      console.log("loading");
    } else {
      boardData = myBoardsResult.all.map(((board: IBoardItemResponse) => new Board().build(board))); //convert boards to Board[]
      console.log("boardData", boardData);
    }

    const springs = useSpring({
        from: { opacity: 0 },
        to: { opacity: 1 },
      });
    

  return (
    <>
        {boardData?.length ? (
        <animated.ul className="grid ps-0 list-unstyled mb-24">
            {boardData.map((board: Board) => {
                const { id, title, imageUrl } = board;
                return(
                    <animated.li
                        className="g-col-4 z-1 boardSizing"
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
                                {imageUrl && (
                                    <img src={imageUrl} alt="Resource" className="board-image card-section" />
                                )}
                                <Card.Title>
                                    {title}
                                </Card.Title>

                                <div>
                                    <Icon path={mdiFolderPlus} size={1} className="med-resource-card-text"></Icon>
                                    <Card.Text className="med-resource-card-text">369 aimants</Card.Text>
                                </div>

                                <div>
                                    <Icon path={mdiCalendarBlank} size={1}></Icon>
                                    <Card.Text className="med-resource-card-text">date</Card.Text>
                                    <Icon path={mdiStar} size={1}></Icon>
                                    <Icon path={mdiAccountCircle} size={1}></Icon>
                                    <Icon path={mdiShareVariant} size={1}></Icon>
                                </div>
                                    
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
