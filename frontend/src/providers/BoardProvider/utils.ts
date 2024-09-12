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

export const fetchZoomPreference = async () => {
  try {
    const response = await fetch('http://localhost:4201/userbook/preference/magneto');
    
    if (!response.ok) {
      throw new Error(`Erreur réseau: ${response.status}`);
    }
    
    const data = await response.json();
    const preferenceObj = JSON.parse(data.preference);
    const zoomPreference = preferenceObj.zoomPreferences;
    console.log({zoomPreference});
    
    return zoomPreference;
  } catch (error) {
    console.error('Erreur lors de la requête:', error);
    throw error; // Propagez l'erreur pour la gérer à l'extérieur si nécessaire
  }
};
