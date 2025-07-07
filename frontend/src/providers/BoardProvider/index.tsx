import {
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { isActionAvailable, RightRole } from "@edifice.io/client";
import { checkUserRight, useEdificeClient } from "@edifice.io/react";
import { useParams } from "react-router-dom";

import {
  BoardContextType,
  BoardProviderProps,
  DisplayModalsState,
} from "./types";
import {
  fetchZoomPreference,
  initialDisplayModals,
  updateZoomPreference,
} from "./utils";
import { workflowName } from "~/config";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { useEntcoreBehaviours } from "~/hooks/useEntcoreBehaviours";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { Card } from "~/models/card.model";
import { useGetBoardDataQuery } from "~/services/api/boardData.service";
import { useGetAllBoardImagesQuery } from "~/services/api/boards.service";
import { useGetDocumentsQuery } from "~/services/api/workspace.service";
import { useActions } from "~/services/queries";
import { useWebSocketConnection } from "~/services/websocket/useWebSocketManager";

const BoardContext = createContext<BoardContextType | null>(null);

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
};

export const BoardProvider: FC<BoardProviderProps> = ({
  children,
  isExternal,
}) => {
  const [isFileDragging, setIsFileDragging] = useState<boolean>(false);
  const [isModalDuplicate, setIsModalDuplicate] = useState<boolean>(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(3);
  const [displayModals, setDisplayModals] =
    useState<DisplayModalsState>(initialDisplayModals);
  const { id = "" } = useParams();
  const { data: actions } = useActions();
  const canSynchronous = isActionAvailable(workflowName.synchronous, actions);
  const isLocalhost = window.location.hostname === "localhost";
  const getSocketURL = useCallback(() => {
    return isLocalhost
      ? `ws://${window.location.hostname}:9091/magneto/${id}`
      : `wss://${window.location.hostname}:9091/magneto/${id}`;
  }, [isLocalhost]);

  useWebSocketConnection(getSocketURL(), canSynchronous);
  const {
    data: boardData,
    isLoading,
    isFetching,
  } = useGetBoardDataQuery({ boardId: id, isExternal });
  const { data: documentsData } = useGetDocumentsQuery("stub");
  const { behaviours, isLoading: isLoadingBehaviours } = useEntcoreBehaviours();

  const initLool = async () => {
    await behaviours.applicationsBehaviours["lool"].init();
  };

  useEffect(() => {
    initLool();
  }, [isLoadingBehaviours]);

  const [boardRights, setBoardRights] = useState<Record<
    RightRole,
    boolean
  > | null>(null);
  const { user } = useEdificeClient();

  const zoomIn = (): void => {
    if (zoomLevel < 5) setZoomLevel(zoomLevel + 1);
  };

  const zoomOut = (): void => {
    if (zoomLevel > 0) setZoomLevel(zoomLevel - 1);
  };

  const resetZoom = (): void => {
    setZoomLevel(3);
  };

  const board = useMemo(() => {
    return boardData
      ? new Board().build(boardData as IBoardItemResponse)
      : new Board();
  }, [boardData]);

  const boardResourceIds = useMemo(() => {
    const cards = board?.isLayoutFree()
      ? board.cards
      : board.sections.flatMap((section) => section.cards || []);
    if (!cards) return [];
    return cards
      .filter(
        (card) => card.resourceType === "board" && card.resourceUrl !== null,
      )
      .map((card) => card.resourceUrl);
  }, [board]);

  const { data: boardImages } = useGetAllBoardImagesQuery(boardResourceIds, {
    skip: !boardResourceIds?.length,
  });

  const documents = useMemo(() => {
    return documentsData ?? [];
  }, [documentsData]);

  const prepareZoom = async () => {
    const zoom = await fetchZoomPreference();
    setZoomLevel(zoom);
  };

  const updateRights = async (rights: any) => {
    setBoardRights(await checkUserRight(rights, "publish"));
  };

  useEffect(() => {
    prepareZoom();
  }, []);

  useEffect(() => {
    updateZoomPreference(zoomLevel);
  }, [zoomLevel]);

  useEffect(() => {
    if (boardData && !isLoading) {
      updateRights(new Board().build(boardData as IBoardItemResponse).rights);
    }
  }, [boardData]);

  const isExternalView =
    board.isExternal && window.location.hash.includes("/pub/");

  const hasContribRights = (): boolean => {
    return (
      (board.owner.userId === user?.userId || !!boardRights?.contrib) &&
      !isExternalView
    );
  };

  const hasEditRights = (): boolean => {
    return (
      (board.owner.userId === user?.userId || !!boardRights?.publish) &&
      !isExternalView
    );
  };

  const hasManageRights = (): boolean => {
    return (
      (board.owner.userId === user?.userId || !!boardRights?.manager) &&
      !isExternalView
    );
  };

  const toggleBoardModals = (modalType: BOARD_MODAL_TYPE) =>
    setDisplayModals((prevState) => ({
      ...prevState,
      [modalType]: !prevState[modalType],
    }));

  const cleanActiveCard = () => setActiveCard(null);

  const openActiveCardAction = (card: Card, actionType: BOARD_MODAL_TYPE) => {
    setActiveCard(card);
    toggleBoardModals(actionType);
  };

  const closeActiveCardAction = (actionType: BOARD_MODAL_TYPE) => {
    setActiveCard(null);
    toggleBoardModals(actionType);
  };

  const value = useMemo<BoardContextType>(
    () => ({
      board,
      documents,
      zoomLevel,
      setZoomLevel,
      zoomIn,
      zoomOut,
      resetZoom,
      isLoading,
      isFetching,
      boardRights,
      hasContribRights,
      hasEditRights,
      hasManageRights,
      displayModals,
      toggleBoardModals,
      isFileDragging,
      setIsFileDragging,
      activeCard,
      setActiveCard,
      isModalDuplicate,
      setIsModalDuplicate,
      cleanActiveCard,
      openActiveCardAction,
      closeActiveCardAction,
      behaviours,
      boardImages,
      isExternalView,
    }),
    [
      board,
      documents,
      zoomLevel,
      isLoading,
      boardRights,
      displayModals,
      isFileDragging,
      activeCard,
      isModalDuplicate,
      behaviours,
      boardImages,
    ],
  );

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
};
