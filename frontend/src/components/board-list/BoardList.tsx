import React, { useEffect, useState } from "react";

import { Card, useOdeClient, Tooltip } from "@edifice-ui/react";
import {
  mdiAccountCircle,
  mdiCalendarBlank,
  mdiCrown,
  mdiEarth,
  mdiMagnet,
  mdiShareVariant,
} from "@mdi/js";
import { Icon } from "@mdi/react";
import { animated, useSpring } from "@react-spring/web";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import "./BoardList.scss";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import {
  Board,
  IBoardItemResponse,
  IBoardsParamsRequest,
} from "~/models/board.model";
import { Folder } from "~/models/folder.model";
import {
  useGetBoardsQuery,
  useGetAllBoardsQuery,
} from "~/services/api/boards.service";

type BoardListProps = {
  currentFolder: Folder;
  boardIds: String[];
  selectedBoards: Board[];
  setBoardIds: React.Dispatch<React.SetStateAction<String[]>>;
  setSelectedBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  searchText: string;
};

export const BoardList: React.FunctionComponent<BoardListProps> = ({
  currentFolder,
  boardIds,
  selectedBoards,
  setBoardIds,
  setSelectedBoards,
  searchText,
}) => {
  const { user, currentApp } = useOdeClient();
  const { t } = useTranslation();

  const userId = user ? user?.userId : "";

  let boardData;
  let allBoardData;
  const [boardsQuery, setBoardsQuery] = useState<IBoardsParamsRequest>({
    isPublic: false,
    isShared: true,
    isDeleted: false,
    sortBy: "modificationDate",
  });
  const allBoardsQuery = {
    isPublic: false,
    isShared: true,
    isDeleted: false,
    sortBy: "modificationDate",
  };

  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  const isSameAsUser = (id: string) => {
    return id == userId;
  };

  useEffect(() => {
    if (
      !currentFolder.id ||
      currentFolder.id == FOLDER_TYPE.MY_BOARDS ||
      currentFolder.id == FOLDER_TYPE.PUBLIC_BOARDS ||
      currentFolder.id == FOLDER_TYPE.DELETED_BOARDS ||
      currentFolder.id == ""
    ) {
      setBoardsQuery((prevBoardsQuery) => ({
        ...prevBoardsQuery,
        folderId: undefined,
        isPublic: !!currentFolder.isPublic,
        isDeleted: !!currentFolder.deleted,
      }));
    } else if (!!currentFolder && !!currentFolder.id) {
      setBoardsQuery((prevBoardsQuery) => ({
        ...prevBoardsQuery,
        folderId: currentFolder.id,
        isPublic: !!currentFolder.isPublic,
        isDeleted: !!currentFolder.deleted,
      }));
    } else {
      console.log("currentFolder undefined, try later or again");
    }
  }, [currentFolder]);

  const {
    data: myBoardsResult,
    isLoading: getBoardsLoading,
    error: getBoardsError,
  } = useGetBoardsQuery(boardsQuery) || {};
  if (getBoardsError) {
    console.log("error");
  } else if (getBoardsLoading) {
    console.log("loading");
  } else {
    boardData = myBoardsResult.all.map((board: IBoardItemResponse) =>
      new Board().build(board),
    ); //convert boards to Board[]
  }

  const {
    data: myAllBoardsResult,
    isLoading: getAllBoardsLoading,
    error: getAllBoardsError,
  } = useGetAllBoardsQuery(allBoardsQuery) || {};
  if (getAllBoardsError) {
    console.log("error");
  } else if (getAllBoardsLoading) {
    console.log("loading");
  } else {
    allBoardData = myAllBoardsResult.all.map((board: IBoardItemResponse) =>
      new Board().build(board),
    ); //convert boards to Board[]
  }

  async function toggleSelect(resource: Board) {
    if (boardIds.includes(resource.id)) {
      setBoardIds(
        boardIds.filter(
          (selectedResource: String) => selectedResource !== resource.id,
        ),
      );
      setSelectedBoards(
        selectedBoards.filter(
          (selectedResource) => selectedResource.id !== resource.id,
        ),
      );
      return;
    }
    setBoardIds([...boardIds, resource.id]);
    setSelectedBoards([...selectedBoards, resource]);
  }

  function isInFilter(board: Board) {
    if (
      board.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (board.description != null &&
        board.description.toLowerCase().includes(searchText.toLowerCase()))
    )
      return true;
    if (board.tags == null || board.tags.length == 0) {
      return false;
    }
    return board.tags.some((tag) =>
      tag.toLowerCase().includes(searchText.toLowerCase()),
    );
  }

  const boardsToDisplay = searchText !== "" ? allBoardData : boardData;

  return (
    <>
      {boardsToDisplay?.length ? (
        <animated.ul className="grid ps-0 list-unstyled mb-24">
          {boardsToDisplay
            .filter((board: Board) => {
              if (searchText === "") {
                return board;
              } else if (isInFilter(board)) {
                return board;
              }
            })
            .map((board: Board) => {
              const {
                id,
                title,
                imageUrl,
                nbCards,
                shared,
                owner,
                modificationDate,
                isPublished,
              } = board;
              return (
                <animated.li
                  className="g-col-4 z-1 boardSizing"
                  key={id}
                  style={{
                    position: "relative",
                    ...springs,
                  }}
                >
                  <Card
                    app={currentApp!}
                    isSelectable={true}
                    isSelected={boardIds.includes(id)}
                    onSelect={() => toggleSelect(board)}
                  >
                    <Card.Body flexDirection={"column"}>
                      <Card.Image
                        imageSrc={imageUrl}
                        variant="landscape"
                      ></Card.Image>
                      <Card.Title>{title}</Card.Title>

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
