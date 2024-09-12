import { odeServices } from "edifice-ts-client";

import {
  Board,
  IBoardItemResponse,
  IBoardsResponse,
} from "~/models/board.model";

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

export const fetchZoomPreference = async () => {
  try {
    const response = await fetch("userbook/preference/magneto");

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    const preferenceObj = JSON.parse(data.preference);
    const zoomPreference = preferenceObj.zoomPreferences;
    const zoomLevel = convertPreferenceToZoomLevel(zoomPreference);
    return zoomLevel;
  } catch (error) {
    console.error("zoom request Error", error);
    return 3;
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
