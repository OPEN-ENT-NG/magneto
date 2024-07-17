import React, { FunctionComponent } from "react";

import { Button, Modal } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import { BoardKeywordsInput } from "../board-keywords-input/BoardKeywordsInput";
import { Board, BoardForm } from "~/models/board.model";
import { useUpdateBoardMutation } from "~/services/api/boards.service";

type props = {
  isOpen: boolean;
  toggle: () => void;
  board: Board;
};

export const BoardPublicShareModal: FunctionComponent<props> = ({
  isOpen,
  toggle,
  board,
}: props) => {
  const { t } = useTranslation("magneto");
  const [updateBoard] = useUpdateBoardMutation();

  const onSubmit = async (): Promise<void> => {
    try {
      const updatedBoard: BoardForm = new BoardForm().build(board);
      updatedBoard.public = !board.isPublished;
      if (!board.isPublished) updatedBoard.tags = board.tags;
      await updateBoard(updatedBoard.toJSON());
      toggle();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {isOpen && (
        <Modal
          id={"createFolder"}
          isOpen={isOpen}
          onModalClose={toggle}
          viewport={false}
        >
          <Modal.Header onModalClose={toggle}>
            {t(
              !board.isPublished
                ? "magneto.board.publish.title"
                : "magneto.board.unpublish.title",
            )}
          </Modal.Header>
          <Modal.Body>
            <span>
              {t(
                !board.isPublished
                  ? "magneto.board.publish.description"
                  : "magneto.board.unpublish.description",
              )}
            </span>
            {!board.isPublished && <BoardKeywordsInput board={board} />}
          </Modal.Body>
          <Modal.Footer>
            <Button
              color="tertiary"
              type="button"
              variant="ghost"
              onClick={toggle}
            >
              {t("magneto.cancel")}
            </Button>
            <Button
              color="primary"
              type="submit"
              variant="filled"
              onClick={onSubmit}
            >
              {t("magneto.create")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};
