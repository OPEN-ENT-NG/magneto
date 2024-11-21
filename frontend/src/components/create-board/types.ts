import { Board } from "~/models/board.model";

export type CreateBoardProps = {
  isOpen: boolean;
  toggle: () => void;
  boardToUpdate?: Board;
  reset?: () => void;
  parentFolderId?: string;
};

export interface FormInputs {
  title: string;
  description: string;
  enablePublic: boolean;
  formSlug: string;
}
