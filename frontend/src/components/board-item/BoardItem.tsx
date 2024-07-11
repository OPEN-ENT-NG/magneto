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
import dayjs from "dayjs";
import { useDrag } from "react-dnd";
import { useTranslation } from "react-i18next";

import "./BoardItem.scss";
import { Board } from "~/models/board.model";

interface BoardItemProps {
  board: {
    id: string;
    title: string;
    imageUrl: string;
    nbCards: number;
    shared: any;
    owner: any;
    modificationDate: string;
    isPublished: boolean;
  };
  areBoardsLoading: boolean;
  boardIds: string[];
  selectedBoardsData: Board[];
  isBoardDragged: boolean;
  setIsBoardDragged: (isDragged: boolean) => void;
  onDragAndDropBoard: (board: any) => void;
  onSelect: (board: any) => void;
}

export const BoardItem: React.FunctionComponent<BoardItemProps> = ({
  board,
  areBoardsLoading,
  boardIds,
  selectedBoardsData,
  isBoardDragged,
  setIsBoardDragged,
  onDragAndDropBoard,
  onSelect,
}) => {
  const { user, currentApp } = useOdeClient();
  const { t } = useTranslation("magneto");

  const userId = user ? user?.userId : "";
  const [isDragged, setIsDragged] = useState<boolean>(false);

  const [{ isDragging }, drag] = useDrag({
    type: "board",
    item: { board },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const isSameAsUser = (id: string) => {
    return id === userId;
  };

  useEffect(() => {
    onDragAndDropBoard(board);
    setIsBoardDragged(isDragging);
  }, [isDragging]);

  useEffect(() => {
    setIsDragged(
      isBoardDragged &&
        !!selectedBoardsData.find(
          (selectedBoard: Board) =>
            selectedBoard && selectedBoard._id == board.id,
        ),
    );
  }, [isBoardDragged, selectedBoardsData]);

  return (
    <div
      ref={drag}
      className={`board ${isDragging ? "dragging" : ""}`}
      style={{
        opacity: isDragging || isDragged ? 0.5 : 1,
        cursor: "move",
      }}
    >
      <Card
        app={currentApp!}
        options={{
          type: "board",
          title: "",
        }}
        isLoading={areBoardsLoading}
        isSelectable={true}
        isSelected={boardIds.includes(board.id)}
        onSelect={() => onSelect(board)}
      >
        <Card.Body flexDirection={"column"}>
          <Card.Image
            className="image-c"
            imageSrc={board.imageUrl}
            variant="landscape"
          ></Card.Image>
          <Card.Title className="title">{board.title}</Card.Title>

          <div className="board-number-magnets">
            <Icon
              path={mdiMagnet}
              size={1}
              className="med-resource-card-text"
            ></Icon>
            <Card.Text className="med-resource-card-text board-text">
              {board.nbCards} {t("magneto.magnets")}
            </Card.Text>
          </div>

          <div className="board-about">
            <div className="board-about-left-content">
              <Tooltip
                message={t("magneto.board.date.update")}
                placement="bottom"
              >
                <Icon path={mdiCalendarBlank} size={1}></Icon>
              </Tooltip>
              <Card.Text className="med-resource-card-text">
                {dayjs(board.modificationDate, {
                  locale: "fr",
                  format: "YYYY-MM-DD HH:mm:ss",
                }).format("DD MMMM YYYY")}
              </Card.Text>
            </div>
            <div className="board-about-right-content">
              {!isSameAsUser(board.owner.userId) && (
                <Tooltip
                  message={t("magneto.board.tooltip.my.board")}
                  placement="bottom"
                >
                  <Icon path={mdiAccountCircle} size={1}></Icon>
                </Tooltip>
              )}
              {isSameAsUser(board.owner.userId) && (
                <Tooltip message={t("magneto.board.owner")} placement="bottom">
                  <Icon path={mdiCrown} size={1}></Icon>
                </Tooltip>
              )}
              {board.shared?.length > 0 && (
                <Tooltip
                  message={t("magneto.board.tooltip.shared.board")}
                  placement="bottom"
                >
                  <Icon path={mdiShareVariant} size={1}></Icon>
                </Tooltip>
              )}
              {board.isPublished && (
                <Tooltip
                  message={t("magneto.board.tooltip.shared.board")}
                  placement="bottom"
                >
                  <Icon path={mdiEarth} size={1}></Icon>
                </Tooltip>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
