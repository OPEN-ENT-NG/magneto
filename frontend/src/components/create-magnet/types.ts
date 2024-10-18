export interface CreateMagnetProps {
  open: boolean;
}

export interface CardPayload {
  boardId: string;
  caption: string;
  description: string;
  locked: boolean;
  resourceId: string;
  resourceType: string;
  resourceUrl: string | null;
  sectionId?: string;
  title: string;
}
