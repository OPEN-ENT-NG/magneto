export interface CardHeaderProps {
  avatarUrl: string;
  ownerName: string;
  modificationDate: string;
  onToggleDropdown: () => void;
  isLocked: boolean;
}
