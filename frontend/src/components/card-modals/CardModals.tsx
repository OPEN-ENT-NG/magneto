import { memo } from "react";

import { CardModalsProps } from "./types";
import { CardDuplicateOrMoveModal } from "../card-duplicate-or-move-modal/CardDuplicateOrMove";
import { CreateMagnet } from "../create-magnet/CreateMagnet";
import { MessageModal } from "../message-modal/MessageModal";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { MENU_NOT_MEDIA_TYPE } from "~/core/enums/menu-not-media-type.enum";

export const CardModals = memo(
  ({
    ressourceType,
    isActiveCardId,
    displayModals,
    deleteMagnet,
    closeActiveCardAction,
    t,
  }: CardModalsProps) => (
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
      {isActiveCardId && displayModals.CREATE_EDIT && (
        <CreateMagnet open={ressourceType === MENU_NOT_MEDIA_TYPE.TEXT} />
      )}
    </>
  ),
);

CardModals.displayName = "CardModals";
