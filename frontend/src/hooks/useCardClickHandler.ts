import { useCallback, useRef } from "react";

import { POINTER_TYPES } from "~/core/constants/pointerTypes.const";

export const isClickable = (event: React.MouseEvent): boolean => {
  const element = event.target as Element;
  const isNonSelectable =
    element.closest(`[data-type="${POINTER_TYPES.NON_SELECTABLE}"]`) !== null;
  const dropdownOpen = document.querySelector('[data-dropdown-open="true"]');
  return !isNonSelectable && !dropdownOpen;
};
export const isInCardContent = (event: React.MouseEvent): boolean => {
  const element = event.target as Element;
  const isCardContent =
    element.closest(`[data-type="${POINTER_TYPES.CARD_CONTENT}"]`) !== null;
  return isCardContent;
};

export const useCardClickHandler = (
  handleSimpleClick: (e: React.MouseEvent) => void,
  handleDoubleClick: (e: React.MouseEvent) => void,
) => {
  const lastClickTimeRef = useRef(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (e: React.MouseEvent) => {
      if (!isClickable(e)) {
        e.stopPropagation();
        return;
      }

      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastClickTimeRef.current;

      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }

      if (timeDiff < 300) {
        handleDoubleClick(e);
        lastClickTimeRef.current = 0;
        return;
      }

      lastClickTimeRef.current = currentTime;
      clickTimeoutRef.current = setTimeout(() => {
        handleSimpleClick(e);
      }, 300);
    },
    [handleSimpleClick, handleDoubleClick],
  );
};
