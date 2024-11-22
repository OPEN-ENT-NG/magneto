import { memo } from "react";

import { ModalsProps } from "./types";
import { CardDuplicateOrMoveModal } from "../card-duplicate-or-move-modal/CardDuplicateOrMove";
import { MessageModal } from "../message-modal/MessageModal";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";

export const CardModals = memo(
  ({
    isActiveCardId,
    displayModals,
    deleteMagnet,
    closeActiveCardAction,
    t,
  }: ModalsProps) => (
    <>
      {isActiveCardId && displayModals.DELETE_MODAL && (
        <MessageModal
          isOpen={isActiveCardId && displayModals.DELETE_MODAL}
          title={t("magneto.delete.cards")}
          onSubmit={deleteMagnet}
          disableSubmit={() => false}
          submitButtonName={t("magneto.delete")}
          cancelButtonName={t("magneto.cancel")}
          onClose={() => closeActiveCardAction(BOARD_MODAL_TYPE.DELETE)}
        >
          {t("magneto.delete.cards.message")}
        </MessageModal>
      )}
      {isActiveCardId && displayModals.DUPLICATE_OR_MOVE && (
        <CardDuplicateOrMoveModal
          isOpen={isActiveCardId && displayModals.DUPLICATE_OR_MOVE}
        />
      )}
    </>
  ),
);

CardModals.displayName = "CardModals";
