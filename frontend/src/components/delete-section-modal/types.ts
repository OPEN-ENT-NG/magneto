import { Section } from "~/providers/BoardProvider/types";

export interface DeleteSectionModalProps {
  open: boolean;
  onClose: () => void;
  section: Section;
}
