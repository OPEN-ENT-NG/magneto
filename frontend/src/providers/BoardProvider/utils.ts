import { odeServices } from "@edifice.io/client";

import { DisplayModalsState } from "./types";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import {
  Board,
  IBoardItemResponse,
  IBoardsResponse,
} from "~/models/board.model";

export const initialDisplayModals: DisplayModalsState = {
  [BOARD_MODAL_TYPE.PARAMETERS]: false,
  [BOARD_MODAL_TYPE.COMMENT_PANEL]: false,
  [BOARD_MODAL_TYPE.CARD_PREVIEW]: false,
  [BOARD_MODAL_TYPE.DELETE]: false,
  [BOARD_MODAL_TYPE.DUPLICATE_OR_MOVE]: false,
  [BOARD_MODAL_TYPE.CREATE_EDIT]: false,
  [BOARD_MODAL_TYPE.BOARD_SELECTION]: false,
};

export const prepareBoardsState = (
  myBoardResponse: IBoardsResponse,
  isDeleted: boolean,
) => {
  return myBoardResponse.all.map((board: IBoardItemResponse) =>
    new Board().build({ ...board, deleted: isDeleted }),
  );
};

const convertPreferenceToZoomLevel = (zoom: number): number => {
  if (zoom < 55 || zoom > 130) return 3;
  const normalizedZoom = Math.round((zoom - 55) / 15);
  return Math.min(normalizedZoom, 5);
};

const convertZoomLevelToPreference = (level: number): number => {
  if (level < 0 || level > 5) return 100;
  return 55 + level * 15;
};

const getPreference: (name: string) => Promise<number> = async (name) => {
  try {
    const result: { zoomPreferences: number } = await odeServices
      .conf()
      .getPreference(name);
    return result.zoomPreferences;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  }
};

const savePreference = async (
  key: string,
  value: string | number | boolean,
) => {
  const result = await odeServices
    .conf()
    .savePreference("magneto", JSON.stringify({ [key]: value }));
  return result;
};

export const fetchZoomPreference = async () => {
  try {
    const zoomPreferences = await getPreference("magneto");
    const zoomLevel = convertPreferenceToZoomLevel(zoomPreferences);

    if (
      typeof zoomLevel !== "number" ||
      isNaN(zoomLevel) ||
      zoomLevel < 0 ||
      zoomLevel > 5 ||
      !Number.isInteger(zoomLevel)
    ) {
      return 3;
    }

    return zoomLevel;
  } catch (error) {
    console.error("zoom request Error", error);
    return 3;
  }
};

export const updateZoomPreference = async (newZoomLevel: number) => {
  try {
    const zoomPreference = convertZoomLevelToPreference(newZoomLevel);
    await savePreference("zoomPreferences", zoomPreference);
    return true;
  } catch (error) {
    console.error("Zoom update request Error", error);
    return false;
  }
};
