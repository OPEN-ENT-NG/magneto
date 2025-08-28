export interface CreateMagnetProps {
  descriptionScraped?: string;
}

export interface CardPayload {
  id?: string;
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
