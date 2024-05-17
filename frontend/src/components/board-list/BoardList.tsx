import React, { useEffect, useState } from "react";
import dayjs from 'dayjs';

import { Card, useOdeClient, ActionBar, Tooltip } from "@edifice-ui/react";
import {  animated, useSpring } from "@react-spring/web";

import { useToaster } from "../../hooks/useToaster"

import "./BoardList.scss";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { useGetBoardsQuery } from "~/services/api/boards.service";
import { Board, IBoardItemResponse, IBoardsParamsRequest, IBoardsResponse } from "~/models/board.model";
import { mdiAccountCircle, mdiCalendarBlank, mdiCrown, mdiEarth, mdiMagnet, mdiShareVariant } from "@mdi/js";
import { Icon } from "@mdi/react";
import { useTranslation } from "react-i18next";




export const BoardList = () => {
    const { user, currentApp } = useOdeClient();
    const { t } = useTranslation();
    const [currentFolder, setCurrentFolder] = useState(new Folder());

  const userId = user ? user?.userId : "";

    let boardData;
    let boardsQuery: IBoardsParamsRequest = {
        isPublic: false,
        isShared: true,
        isDeleted: false,
        sortBy: 'modificationDate',
        page: 0
    }
    
    const getFolderBoards = (): void => {
        if (!currentFolder.id || currentFolder.id == "my-boards" || currentFolder.id == "") {
            boardsQuery.folderId = undefined;
        } else if (!!currentFolder && !!currentFolder.id) { 
            boardsQuery.folderId = currentFolder.id;
        } else {
            console.log("currentFolder undefined, try later or again");
        }
    }

  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

    const isSameAsUser = (id: string) => {
        return id == userId;
    }

    useEffect(() => {
        getFolderBoards();
    }, [currentFolder]);

    const { data: myBoardsResult, isLoading: getBoardsLoading, error: getBoardsError } = useGetBoardsQuery(boardsQuery) || {};
    
    if (getBoardsError) {
        console.log("error");
    } else if (getBoardsLoading) {
        console.log("loading");
    } else {
        boardData = myBoardsResult.all.map(((board: IBoardItemResponse) => new Board().build(board))); //convert boards to Board[]
        console.log("boardData", boardData);
    }


  return (
    <>
      {boardData?.length ? (
        <animated.ul className="grid ps-0 list-unstyled mb-24">
            {boardData.map((board: Board) => {
                const { id, title, imageUrl, nbCards, shared, owner, modificationDate, isPublished } = board;
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
                        >
                            <Card.Body 
                                flexDirection={"column"}>

                                <Card.Image
                                    imageSrc={imageUrl}
                                    variant="landscape">

                                </Card.Image>
                                <Card.Title>
                                    {title}
                                </Card.Title>

                    <div className="board-number-magnets">
                      <Icon
                        path={mdiMagnet}
                        size={1}
                        className="med-resource-card-text"
                      ></Icon>
                      <Card.Text className="med-resource-card-text board-text">
                        {nbCards} {t("magneto.magnets")}
                      </Card.Text>
                    </div>

                    <div className="board-about">
                      <div className="board-about">
                        <Tooltip
                          message={t("magneto.board.date.update")}
                          placement="bottom"
                        >
                          <Icon path={mdiCalendarBlank} size={1}></Icon>
                        </Tooltip>
                        <Card.Text className="med-resource-card-text">
                          {dayjs(
                            modificationDate,
                            "YYYY-MM-DD HH:mm:ss",
                          ).format("DD MMMM YYYY")}
                        </Card.Text>
                      </div>
                      <div className="board-about">
                        <Tooltip
                          message={t("magneto.board.tooltip.my.board")}
                          placement="bottom"
                        >
                          {!isSameAsUser(owner.userId) && (
                            <Icon path={mdiCrown} size={1}></Icon>
                          )}
                        </Tooltip>
                        <Tooltip
                          message={t("magneto.board.owner")}
                          placement="bottom"
                        >
                          {isSameAsUser(owner.userId) && (
                            <Icon path={mdiAccountCircle} size={1}></Icon>
                          )}
                        </Tooltip>
                        <Tooltip
                          message={t("magneto.board.tooltip.shared.board")}
                          placement="bottom"
                        >
                          {shared?.length && (
                            <Icon path={mdiShareVariant} size={1}></Icon>
                          )}
                        </Tooltip>
                        <Tooltip
                          message={t("magneto.board.tooltip.shared.board")}
                          placement="bottom"
                        >
                          {isPublished && (
                            <Icon path={mdiEarth} size={1}></Icon>
                          )}
                        </Tooltip>
                      </div>
                    </div>
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
