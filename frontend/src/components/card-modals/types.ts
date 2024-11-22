import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { DisplayModalsState } from "~/providers/BoardProvider/types";

export interface ModalsProps {
  isActiveCardId: boolean;
  displayModals: DisplayModalsState;
  deleteMagnet: () => Promise<void>;
  closeActiveCardAction: (type: BOARD_MODAL_TYPE) => void;
  t: (key: string) => string;
}
