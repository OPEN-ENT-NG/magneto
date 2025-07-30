import { useRef, useMemo, useCallback } from "react";

import { useUser } from "@edifice.io/react";

import {
  isClickable,
  isInCardContent,
  useCardClickHandler,
} from "./useCardClickHandler";
import useDirectory from "./useDirectory";
import { useResourceTypeDisplay } from "~/components/board-card/useResourceTypeDisplay";
import { useDropdown } from "~/components/drop-down-list/useDropDown";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { RESOURCE_TYPE } from "~/core/enums/resource-type.enum";
import { WEBSOCKET_MESSAGE_TYPE } from "~/core/enums/websocket-message-type";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";
import { useMediaLibrary } from "~/providers/MediaLibraryProvider";
import { useWebSocketMagneto } from "~/providers/WebsocketProvider";
import {
  useUpdateCardMutation,
  useFavoriteCardMutation,
  useDeleteCardsMutation,
} from "~/services/api/cards.service";
//import { useWebSocketManager } from "~/services/websocket/useWebSocketManager";

export const useBoardCard = (card: Card) => {
  const [updateCard] = useUpdateCardMutation();
  const [favoriteCard] = useFavoriteCardMutation();
  const [deleteCards] = useDeleteCardsMutation();
  const { sendMessage, readyState } = useWebSocketMagneto();

  const {
    board,
    hasEditRights: hasEditRightsFn,
    hasManageRights: hasManageRightsFn,
    activeCard,
    closeActiveCardAction,
    openActiveCardAction,
    hasContribRights: hasContribRightsFn,
  } = useBoard();
  const { setIsCreateMagnetOpen } = useMediaLibrary();
  const { user } = useUser();
  const { openDropdownId, registerDropdown, toggleDropdown, closeDropdown } =
    useDropdown();
  const { icon, type } = useResourceTypeDisplay(card.resourceType);
  const { getAvatarURL } = useDirectory();

  const dropdownRef = useRef<HTMLDivElement>(null);

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
    [
      card.id,
      card.caption,
      card.description,
      card.resourceId,
      card.resourceType,
      card.resourceUrl,
      card.title,
      board._id,
    ],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasEditRights || hasManageRights) {
        setIsCreateMagnetOpen(true);
        openActiveCardAction(card, BOARD_MODAL_TYPE.CREATE_EDIT);
      } else openActiveCardAction(card, BOARD_MODAL_TYPE.CARD_PREVIEW);
    },
    [card, openActiveCardAction],
  );

  const handleSimpleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (card.resourceType === RESOURCE_TYPE.BOARD && isInCardContent(e)) {
        window.open(
          `/magneto#/board/${card.resourceUrl}/view`,
          "_blank",
          "noopener,noreferrer",
        );
      }
    },
    [card.resourceType, card.resourceUrl],
  );

  const customClickHandler = useCardClickHandler(
    handleSimpleClick,
    handleDoubleClick,
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isClickable(e)) return;
      if (hasContribRightsFn()) {
        customClickHandler(e);
      } else {
        handleDoubleClick(e);
      }
    },
    [hasContribRightsFn, customClickHandler, handleDoubleClick],
  );

  const handleToggleDropdown = useCallback(() => {
    if (card.id) toggleDropdown(card.id);
  }, [card.id, toggleDropdown]);

  const handleDropdownClose = useCallback(() => {
    toggleDropdown(null);
  }, [toggleDropdown]);

  const lockOrUnlockMagnet = useCallback(async () => {
    if (readyState === WebSocket.OPEN) {
      sendMessage(
        JSON.stringify({
          type: WEBSOCKET_MESSAGE_TYPE.CARD_UPDATED,
          card: {
            ...cardPayload,
            locked: !card.locked,
          },
        }),
      );
    } else {
      await updateCard({
        ...cardPayload,
        locked: !card.locked,
      });
    }
  }, [cardPayload, card.locked, updateCard]);

  const deleteMagnet = useCallback(async () => {
    if (readyState === WebSocket.OPEN) {
      sendMessage(
        JSON.stringify({
          type: WEBSOCKET_MESSAGE_TYPE.CARDS_DELETED,
          cardIds: [card.id],
          boardId: board.id,
        }),
      );
    } else {
      await deleteCards({ cardIds: [card.id], boardId: board.id });
    }
    closeActiveCardAction(BOARD_MODAL_TYPE.DELETE);
  }, [card.id, board.id, deleteCards, closeActiveCardAction]);

  const handleFavoriteClick = useCallback(() => {
    if (readyState === WebSocket.OPEN) {
      sendMessage(
        JSON.stringify({
          type: WEBSOCKET_MESSAGE_TYPE.CARD_FAVORITE,
          card: { id: card.id, isFavorite: card.liked },
        }),
      );
    } else {
      favoriteCard({ cardId: card.id, isFavorite: card.liked });
    }
  }, [card.id, card.liked, favoriteCard, sendMessage]);

  const hasEditRights = useMemo(() => hasEditRightsFn(), [hasEditRightsFn]);
  const hasContribRights = useMemo(
    () => hasContribRightsFn(),
    [hasContribRightsFn],
  );
  const hasManageRights = useMemo(
    () => hasManageRightsFn(),
    [hasManageRightsFn],
  );
  const isOpen = useMemo(
    () => openDropdownId === card.id,
    [openDropdownId, card.id],
  );
  const isActiveCardId = useMemo(
    () => activeCard?.id === card.id,
    [activeCard?.id, card.id],
  );
  const isMagnetOwner = useMemo(
    () => card.ownerId === user?.userId,
    [card.ownerId, user?.userId],
  );
  const isLockedBoard = useMemo(() => board.isLocked, [board.isLocked]);

  return useMemo(
    () => ({
      icon,
      type,
      isLockedBoard,
      hasEditRights,
      hasContribRights,
      isOpen,
      isActiveCardId,
      isMagnetOwner,
      isManager: hasManageRights,
      dropdownRef,
      getAvatarURL,
      lockOrUnlockMagnet,
      deleteMagnet,
      handleToggleDropdown,
      handleDropdownClose,
      handleFavoriteClick,
      registerDropdown,
      closeDropdown,
      handleClick,
    }),
    [
      icon,
      type,
      isLockedBoard,
      hasEditRights,
      hasContribRights,
      isOpen,
      isActiveCardId,
      isMagnetOwner,
      hasManageRights,
      getAvatarURL,
      lockOrUnlockMagnet,
      deleteMagnet,
      handleToggleDropdown,
      handleDropdownClose,
      handleFavoriteClick,
      registerDropdown,
      closeDropdown,
      handleClick,
    ],
  );
};
