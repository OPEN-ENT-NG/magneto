import React, { useEffect } from "react";

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
  onDragAndDropBoard: (board: any) => void;
  onSelect: (board: any) => void;
}

export const BoardItem: React.FunctionComponent<BoardItemProps> = ({
  board,
  areBoardsLoading,
  boardIds,
  onDragAndDropBoard,
  onSelect,
}) => {
  const { user, currentApp } = useOdeClient();
  const { t } = useTranslation("magneto");

  const userId = user ? user?.userId : "";

  const [{ isDragging }, drag] = useDrag({
    type: "board",
    item: { board },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    // end: //...
  });

  const isSameAsUser = (id: string) => {
    return id == userId;
  };

  useEffect(() => {
    onDragAndDropBoard(board);
  }, [isDragging]);

  return (
    <div
      ref={drag}
      className={`board ${isDragging ? "dragging" : ""}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
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
                {dayjs(board.modificationDate, "YYYY-MM-DD HH:mm:ss").format(
                  "DD MMMM YYYY",
                )}
              </Card.Text>
            </div>
            <div className="board-about-right-content">
              <Tooltip
                message={t("magneto.board.tooltip.my.board")}
                placement="bottom"
              >
                {!isSameAsUser(board.owner.userId) && (
                  <Icon path={mdiCrown} size={1}></Icon>
                )}
              </Tooltip>
              <Tooltip message={t("magneto.board.owner")} placement="bottom">
                {isSameAsUser(board.owner.userId) && (
                  <Icon path={mdiAccountCircle} size={1}></Icon>
                )}
              </Tooltip>
              <Tooltip
                message={t("magneto.board.tooltip.shared.board")}
                placement="bottom"
              >
                {board.shared?.length && (
                  <Icon path={mdiShareVariant} size={1}></Icon>
                )}
              </Tooltip>
              <Tooltip
                message={t("magneto.board.tooltip.shared.board")}
                placement="bottom"
              >
                {board.isPublished && <Icon path={mdiEarth} size={1}></Icon>}
              </Tooltip>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
