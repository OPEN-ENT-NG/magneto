import { useCallback, useMemo, useRef } from "react";

import { useUser } from "@edifice-ui/react";

import useDirectory from "./useDirectory";
import { useResourceTypeDisplay } from "~/components/board-card/useResourceTypeDisplay";
import { useDropdown } from "~/components/drop-down-list/useDropDown";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";
import {
  useUpdateCardMutation,
  useFavoriteCardMutation,
  useDeleteCardsMutation,
} from "~/services/api/cards.service";

export const useBoardCard = (card: Card) => {
  const [updateCard] = useUpdateCardMutation();
  const [favoriteCard] = useFavoriteCardMutation();
  const [deleteCards] = useDeleteCardsMutation();

  const {
    board,
    hasEditRights,
    hasManageRights,
    activeCard,
    closeActiveCardAction,
    openActiveCardAction,
    hasContribRights,
  } = useBoard();
  const { user } = useUser();
  const { openDropdownId, registerDropdown, toggleDropdown, closeDropdown } =
    useDropdown();
  const { icon, type } = useResourceTypeDisplay(card.resourceType);
  const { getAvatarURL } = useDirectory();

  const dropdownRef = useRef<HTMLDivElement>(null);

  const states = useMemo(
    () => ({
      hasEditRights: hasEditRights(),
      hasContribRights: hasContribRights(),
      isOpen: openDropdownId === card.id,
      isActiveCardId: activeCard?.id === card.id,
      isMagnetOwner: card.ownerId === user?.userId,
      isManager: hasManageRights(),
    }),
    [
      card.id,
      card.ownerId,
      card.locked,
      activeCard?.id,
      user?.userId,
      openDropdownId,
      hasManageRights,
      hasEditRights,
      hasContribRights,
    ],
  );

  const cardPayload = useMemo(
    () => ({
      id: card.id,
      boardId: board._id,
      caption: card.caption,
      description: card.description,
      resourceId: card.resourceId,
      resourceType: card.resourceType,
      resourceUrl: card.resourceUrl,
      title: card.title,
    }),
    [card, board._id],
  );

  const lockOrUnlockMagnet = useCallback(async () => {
    await updateCard({
      ...cardPayload,
      locked: !card.locked,
    });
  }, [cardPayload, card.locked, updateCard]);

  const deleteMagnet = useCallback(async () => {
    await deleteCards({ cardIds: [card.id], boardId: board.id });
    closeActiveCardAction(BOARD_MODAL_TYPE.DELETE);
  }, [card.id, board.id, deleteCards, closeActiveCardAction]);

  const handleToggleDropdown = useCallback(() => {
    if (card.id) {
      toggleDropdown(card.id);
    }
  }, [card.id, toggleDropdown]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      openActiveCardAction(card, BOARD_MODAL_TYPE.CARD_PREVIEW);
    },
    [card],
  );

  const handleDropdownClose = useCallback(() => {
    toggleDropdown(null);
  }, [toggleDropdown]);

  const handleFavoriteClick = useCallback(() => {
    favoriteCard({ cardId: card.id, isFavorite: card.liked });
  }, [card.id, card.liked, favoriteCard]);

  return useMemo(
    () => ({
      icon,
      type,
      ...states,
      dropdownRef,
      getAvatarURL,
      lockOrUnlockMagnet,
      deleteMagnet,
      handleToggleDropdown,
      handleDropdownClose,
      handleFavoriteClick,
      registerDropdown,
      closeDropdown,
      handleDoubleClick,
    }),
    [
      icon,
      type,
      states,
      getAvatarURL,
      lockOrUnlockMagnet,
      deleteMagnet,
      handleToggleDropdown,
      handleDropdownClose,
      handleFavoriteClick,
      registerDropdown,
      closeDropdown,
      handleDoubleClick,
    ],
  );
};
