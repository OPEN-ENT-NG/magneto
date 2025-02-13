import { arrayMove } from "@dnd-kit/sortable";

import { Board } from "~/models/board.model";
import { Card } from "~/models/card.model";
import { Section } from "~/providers/BoardProvider/types";

const getItem = <T extends string | Card>(item: T): string => {
  return typeof item === "string" ? item : item.id;
};

const findItemIndex = <T extends string | Card>(
  array: T[],
  searchItem: T,
): number => {
  if (
    typeof searchItem === "string" &&
    array !== null &&
    typeof array[0] === "string"
  ) {
    return (array as string[]).indexOf(searchItem as string);
  }
  return (array as Card[]).findIndex(
    (item) => (item as Card).id === (searchItem as Card).id,
  );
};

const checkLockedItemsMoved = <T extends string | Card>(
  originalItems: T[],
  movedItems: T[],
  lockedItems: string[],
): boolean => {
  // If no locked items, return true (no movement)
  if (!lockedItems) return true;

  // Find original and final positions of locked items
  for (const lockedItemId of lockedItems) {
    const originalIndex = originalItems.findIndex(
      (item) => getItem(item) === lockedItemId,
    );

    const finalIndex = movedItems.findIndex(
      (item) => getItem(item) === lockedItemId,
    );

    // If locked item's position changed, return false
    if (originalIndex !== finalIndex) {
      return false;
    }
  }

  // All locked items remained in their original positions
  return true;
};

const pushItemsBackwardPastLocks = <T extends string | Card>(
  result: T[],
  oldIndex: number,
  newIndex: number,
  lockedItems: string[],
): void => {
  for (let i = newIndex - 1; i >= oldIndex; i--) {
    if (
      lockedItems.includes(getItem(result[i])) &&
      !lockedItems.includes(getItem(result[i + 1]))
    ) {
      // If we hit a locked item, find next available position
      let availablePos = i - 1;

      while (
        availablePos > 0 &&
        lockedItems.includes(getItem(result[availablePos]))
      ) {
        availablePos--;
      }

      if (availablePos >= 0) {
        // Move the displaced item to the available position
        const [itemToMove] = result.splice(i + 1, 1);

        if (availablePos + 1 === oldIndex) {
          // Replace temp item with the pushed item
          result.splice(availablePos + 1, 1, itemToMove);
        } else {
          // Normal displacement
          result.splice(availablePos + 1, 0, itemToMove);
        }
      }
    }
  }
};

const pushItemsForwardPastLocks = <T extends string | Card>(
  result: T[],
  oldIndex: number,
  newIndex: number,
  endIndex: number,
  lockedItems: string[],
): void => {
  for (let i = newIndex + 1; i <= endIndex; i++) {
    if (
      lockedItems.includes(getItem(result[i])) &&
      !lockedItems.includes(getItem(result[i - 1]))
    ) {
      // If we hit a locked item, find next available position
      let availablePos = i + 1;
      while (
        availablePos < result.length &&
        lockedItems.includes(getItem(result[availablePos]))
      ) {
        availablePos++;
      }

      if (availablePos <= result.length) {
        // Move the displaced item to the available position
        const [itemToMove] = result.splice(i - 1, 1);
        if (availablePos - 1 === oldIndex) {
          // Replace temp item with the pushed item
          result.splice(availablePos - 1, 1, itemToMove);
        } else {
          // Normal displacement
          result.splice(availablePos - 1, 0, itemToMove);
        }
      }
    }
  }
};

const pushItemsForwardPastLocksSimple = <T extends string | Card>(
  result: T[],
  newIndex: number,
  endIndex: number,
  lockedItems: string[],
): void => {
  for (let i = newIndex + 1; i <= endIndex; i++) {
    if (
      lockedItems.includes(getItem(result[i])) &&
      !lockedItems.includes(getItem(result[i - 1]))
    ) {
      // If we hit a locked item, find next available position
      let availablePos = i + 1;
      while (
        availablePos < result.length &&
        lockedItems.includes(getItem(result[availablePos]))
      ) {
        availablePos++;
      }

      if (availablePos <= result.length) {
        // Move the displaced item to the available position
        const [itemToMove] = result.splice(i - 1, 1);
        result.splice(availablePos - 1, 0, itemToMove);
      }
    }
  }
};

const pushItemsBackwardPastLocksSimple = <T extends string | Card>(
  result: T[],
  newIndex: number,
  endIndex: number,
  lockedItems: string[],
): void => {
  for (let i = newIndex - 1; i >= endIndex; i--) {
    if (
      lockedItems.includes(getItem(result[i])) &&
      !lockedItems.includes(getItem(result[i + 1]))
    ) {
      // If we hit a locked item, find next available position
      let availablePos = i - 1;

      while (
        availablePos > 0 &&
        lockedItems.includes(getItem(result[availablePos]))
      ) {
        availablePos--;
      }

      if (availablePos >= 0) {
        // Move the displaced item to the available position
        const [itemToMove] = result.splice(i + 1, 1);

        // Normal displacement
        result.splice(availablePos + 1, 0, itemToMove);
      }
    }
  }
};

const reorderWithLockedItemsGeneric = <T extends string | Card>(
  items: T[],
  oldIndex: number,
  newIndex: number,
  lockedItems: string[],
): T[] => {
  if (
    lockedItems.length === 0 ||
    !items
      .slice(Math.min(oldIndex, newIndex), Math.max(oldIndex, newIndex) + 1)
      .some((item) => lockedItems.includes(getItem(item)))
  ) {
    return arrayMove(items, oldIndex, newIndex);
  }

  // If the moved item is locked, return original array
  const itemIdToMove = getItem(items[oldIndex]);
  if (lockedItems.includes(itemIdToMove)) {
    return items;
  }

  // If the destination is locked, return original array
  const itemIdWhereMove = getItem(items[newIndex]);
  if (lockedItems.includes(itemIdWhereMove)) {
    return items;
  }

  const result = [...items];

  const dummyItem =
    typeof items[0] === "string"
      ? ("dummy" as T)
      : ({ id: "dummy", title: "Dummy Item" } as T);

  const [movedItem] = result.splice(oldIndex, 1, dummyItem);

  // Moving right to left
  if (oldIndex > newIndex) {
    // Check if we're trying to move to position right after a locked item
    if (lockedItems.includes(getItem(items[newIndex]))) {
      const lockedIndex = findItemIndex(result, items[newIndex]);

      // Get and remove the item that was after the locked item
      const itemAfterLocked = result[lockedIndex - 1];
      if (itemAfterLocked === undefined) {
        return items;
      }
      result.splice(lockedIndex - 1, 1);

      // Insert moved item after original adjacent item
      result.splice(lockedIndex - 1, 0, movedItem);

      // Insert original adjacent item before locked item
      result.splice(lockedIndex, 0, itemAfterLocked);
    } else {
      // Insert at the target position
      result.splice(newIndex, 0, movedItem);
    }

    // Push displaced items forward past any locked items
    pushItemsForwardPastLocks(
      result,
      oldIndex,
      newIndex,
      oldIndex,
      lockedItems,
    );
  }
  // Moving left to right
  else {
    // Check if we're trying to move to position right after a locked item
    if (lockedItems.includes(getItem(items[newIndex]))) {
      const lockedIndex = findItemIndex(result, items[newIndex]);

      // Get and remove the item that was after the locked item
      const itemAfterLocked = result[lockedIndex + 1];
      if (itemAfterLocked === undefined) {
        return items;
      }
      result.splice(lockedIndex + 1, 1);

      // Insert moved item after original adjacent item
      result.splice(lockedIndex + 1, 0, movedItem);

      // Insert original adjacent item before locked item
      result.splice(lockedIndex, 0, itemAfterLocked);
    } else {
      // Insert at the target position
      result.splice(newIndex + 1, 0, movedItem);
    }

    // Push displaced items backward past any locked items
    pushItemsBackwardPastLocks(result, oldIndex, newIndex, lockedItems);
  }

  // Return new array without dummy items
  return result.filter((item) => {
    const id = getItem(item);
    return id !== "dummy";
  });
};

const reorderOverSectionWithLockedItemsGeneric = <T extends string | Card>(
  items: T[],
  oldIndex: number,
  newIndex: number,
  lockedItems: string[],
): T[] => {
  const movedOverSectionCards = arrayMove(items, oldIndex, newIndex);

  if (
    lockedItems.length === 0 ||
    !movedOverSectionCards
      .slice(newIndex, movedOverSectionCards.length - 1)
      .some((item) => lockedItems.includes(getItem(item)))
  ) {
    return movedOverSectionCards;
  }

  // If the moved item is locked, return original array
  const itemIdToMove = getItem(movedOverSectionCards[oldIndex]);
  if (lockedItems.includes(itemIdToMove)) {
    return movedOverSectionCards;
  }

  const itemIdWhereMove = getItem(movedOverSectionCards[newIndex]);
  if (lockedItems.includes(itemIdWhereMove)) {
    return items;
  }

  const result = [...movedOverSectionCards];

  pushItemsForwardPastLocksSimple(
    result,
    oldIndex,
    result.length - 1,
    lockedItems,
  );

  if (!checkLockedItemsMoved(items, movedOverSectionCards, lockedItems)) {
    return items;
  }

  return result.filter((item) => {
    const id = getItem(item);
    return id !== "dummy";
  });
};

const reorderOriginalSectionWithLockedItemsGeneric = <T extends string | Card>(
  items: T[],
  oldIndex: number,
  lockedItems: string[],
  activeCardId: string,
): T[] => {
  const movedOriginalSectionCards = items.filter(
    (item) => getItem(item) !== activeCardId,
  );

  if (lockedItems.includes(activeCardId)) {
    return movedOriginalSectionCards;
  }

  const result = [...movedOriginalSectionCards];

  pushItemsBackwardPastLocksSimple(
    result,
    result.length - 1,
    oldIndex,
    lockedItems,
  );

  if (!checkLockedItemsMoved(items, result, lockedItems)) {
    return items;
  }

  return result.filter((item) => {
    const id = getItem(item);
    return id !== "dummy";
  });
};

export const canRemoveMagnet = (board: Board, cardId: string): boolean => {
  const lastCard = board.isLayoutFree()
    ? board.cards.at(-1)
    : board.sections
        ?.find((section: Section) =>
          section.cards.find((card: Card) => card.id === cardId),
        )
        ?.cards.at(-1) || null;

  return lastCard ? lastCard.locked && lastCard.id !== cardId : false;
};

const reorderWithLockedItems = (
  items: string[],
  oldIndex: number,
  newIndex: number,
  lockedItems: string[],
): string[] =>
  reorderWithLockedItemsGeneric(items, oldIndex, newIndex, lockedItems);

const reorderWithLockedItemsArray = <T extends Card>(
  items: T[],
  oldIndex: number,
  newIndex: number,
  lockedItems: string[],
): T[] => reorderWithLockedItemsGeneric(items, oldIndex, newIndex, lockedItems);

const reorderOriginalSectionWithLockedItems = (
  items: string[],
  oldIndex: number,
  lockedItems: string[],
  activeCardId: string,
): string[] =>
  reorderOriginalSectionWithLockedItemsGeneric(
    items,
    oldIndex,
    lockedItems,
    activeCardId,
  );

const reorderOriginalSectionWithLockedItemsArray = <T extends Card>(
  items: T[],
  oldIndex: number,
  lockedItems: string[],
  activeCardId: string,
): T[] =>
  reorderOriginalSectionWithLockedItemsGeneric(
    items,
    oldIndex,
    lockedItems,
    activeCardId,
  );

const reorderOverSectionWithLockedItems = (
  items: string[],
  oldIndex: number,
  newIndex: number,
  lockedItems: string[],
): string[] =>
  reorderOverSectionWithLockedItemsGeneric(
    items,
    oldIndex,
    newIndex,
    lockedItems,
  );

const reorderOverSectionWithLockedItemsArray = <T extends Card>(
  items: T[],
  oldIndex: number,
  newIndex: number,
  lockedItems: string[],
): T[] =>
  reorderOverSectionWithLockedItemsGeneric(
    items,
    oldIndex,
    newIndex,
    lockedItems,
  );

export {
  reorderWithLockedItems,
  reorderWithLockedItemsArray,
  reorderOriginalSectionWithLockedItems,
  reorderOriginalSectionWithLockedItemsArray,
  reorderOverSectionWithLockedItems,
  reorderOverSectionWithLockedItemsArray,
};
