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
import { useNavigate } from "react-router-dom";
import "./BoardItem.scss";

import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { Board } from "~/models/board.model";
import { useBoardsNavigation } from "~/providers/BoardsNavigationProvider";
import { styled } from "@mui/material";

interface BoardItemProps {
  board: {
    id: string;
    title: string;
    imageUrl: string;
    nbCards: number;
    nbCardsSections: number;
    layoutType: LAYOUT_TYPE;
    shared: any;
    owner: any;
    modificationDate: string;
    isPublished: boolean;
  };
  onDragAndDropBoard: (board: any) => void;
  isBoardDragged: boolean;
  setIsBoardDragged: (isDragged: boolean) => void;
}

export const BoardItem: React.FunctionComponent<BoardItemProps> = ({
  board,
  onDragAndDropBoard,
  isBoardDragged,
  setIsBoardDragged,
}) => {
  const StyledCardImage = styled(Card.Image)({
    width: "100%",
    position: "relative",
    aspectRatio: "16 / 10",
    backgroundColor: "transparent !important",
  });

  const { user, currentApp } = useOdeClient();
  const { t } = useTranslation("magneto");
  const { selectedBoardsIds, toggleSelect, selectedBoards } =
    useBoardsNavigation();
  const [isDragged, setIsDragged] = useState<boolean>(false);
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  const navigate = useNavigate();

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
    return id === userId;
  };

  useEffect(() => {
    if (hasMounted) {
      onDragAndDropBoard(board);
      setIsBoardDragged(isDragging);
    } else {
      setHasMounted(true);
    }
  }, [isDragging]);

  useEffect(() => {
    setIsDragged(
      isBoardDragged &&
        !!selectedBoards.find(
          (selectedBoard: Board) =>
            selectedBoard && selectedBoard._id == board.id,
        ),
    );
  }, [isBoardDragged, selectedBoards]);

  return (
    <div
      ref={drag}
      className={`board-item board ${isDragging ? "dragging" : ""}`}
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
        isLoading={false}
        isSelectable={true}
        isSelected={selectedBoardsIds.includes(board.id)}
        onSelect={() => toggleSelect(board as Board)}
        onClick={() => navigate(`/board/${board.id}/view`)}
      >
        <Card.Body flexDirection={"column"}>
          <Card.Image
            className="image-c"
            imageSrc={board.imageUrl}
            variant="landscape"
          ></Card.Image>

          <div className="board-title">
            <Tooltip message={board.title} placement="bottom-start">
              <Card.Title className="title">{board.title}</Card.Title>
            </Tooltip>
          </div>

          <div className="board-number-magnets">
            <Icon
              path={mdiMagnet}
              size={1}
              className="med-resource-card-text"
            ></Icon>
            <Card.Text className="med-resource-card-text board-text">
              {board.layoutType == LAYOUT_TYPE.FREE
                ? board.nbCards
                : board.nbCardsSections}{" "}
              {t("magneto.magnets")}
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
                  message={`${t("magneto.board.owner")} : ${
                    board.owner.displayName
                  }`}
                  placement="bottom"
                >
                  <Icon path={mdiAccountCircle} size={1}></Icon>
                </Tooltip>
              )}
              {isSameAsUser(board.owner.userId) && (
                <Tooltip
                  message={t("magneto.board.tooltip.my.board")}
                  placement="bottom"
                >
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
                  message={t("magneto.board.tooltip.public.board")}
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
