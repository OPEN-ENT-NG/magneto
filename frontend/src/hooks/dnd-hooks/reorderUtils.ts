import { arrayMove } from "@dnd-kit/sortable";

import { Card } from "~/models/card.model";

const getItem = <T extends string | Card>(item: T): string => {
  return typeof item === "string" ? item : item.id;
};

const findItemIndex = <T extends string | Card>(
  array: T[],
  searchItem: T,
): number => {
  if (typeof searchItem === "string" && typeof array[0] === "string") {
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
  if (lockedItems.length === 0) return true;

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
    console.log(`Loop iteration - Current index: ${i}`, {
      currentItem: result[i],
      isLocked: lockedItems.includes(getItem(result[i])),
      oldIndex,
      newIndex,
    });

    if (lockedItems.includes(getItem(result[i]))) {
      console.log("Found locked item while pushing backward:", {
        lockedItem: result[i],
        currentIndex: i,
        currentArray: [...result],
      });

      // If we hit a locked item, find next available position
      let availablePos = i - 1;
      console.log("Starting search for available position from:", availablePos);

      while (
        availablePos > 0 &&
        lockedItems.includes(getItem(result[availablePos]))
      ) {
        console.log(
          `Position ${availablePos} is locked, checking previous position`,
        );
        availablePos--;
      }

      console.log("Found available position:", {
        position: availablePos,
        isValid: availablePos >= 0,
      });

      if (availablePos >= 0) {
        // Move the displaced item to the available position
        const [itemToMove] = result.splice(i + 1, 1);
        console.log("Removed displaced item:", {
          itemToMove,
          removedFromIndex: i + 1,
          currentArray: [...result],
        });

        if (availablePos + 1 === oldIndex) {
          // Replace temp item with the pushed item
          result.splice(availablePos + 1, 1, itemToMove);
          console.log("Replaced temp item with pushed item:", {
            itemToMove,
            replacementIndex: availablePos + 1,
            currentArray: [...result],
          });
        } else {
          // Normal displacement
          result.splice(availablePos + 1, 0, itemToMove);
          console.log("Moved displaced item:", {
            itemToMove,
            newPosition: availablePos + 1,
            currentArray: [...result],
          });
        }
      } else {
        console.log("No valid position found for displaced item");
      }
    }
  }
};

function pushItemsForwardPastLocks<T extends string | Card>(
  result: T[],
  oldIndex: number,
  newIndex: number,
  endIndex: number,
  lockedItems: string[],
): void {
  for (let i = newIndex + 1; i <= endIndex; i++) {
    if (lockedItems.includes(getItem(result[i]))) {
      console.log("Found locked item while pushing forward:", {
        lockedItem: result[i],
        currentArray: [...result],
      });

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
          console.log("Replaced temp item with pushed item:", {
            currentArray: [...result],
          });
        } else {
          // Normal displacement
          result.splice(availablePos - 1, 0, itemToMove);
          console.log("Moved displaced item:", {
            itemToMove,
            newPosition: availablePos - 1,
            currentArray: [...result],
          });
        }
      }
    }
  }
}

function pushItemsForwardPastLocksSimple<T extends string | Card>(
  result: T[],
  newIndex: number,
  endIndex: number,
  lockedItems: string[],
): void {
  for (let i = newIndex + 1; i <= endIndex; i++) {
    if (lockedItems.includes(getItem(result[i]))) {
      console.log("Found locked item while pushing forward:", {
        lockedItem: result[i],
        currentArray: [...result],
      });

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
        console.log("Moved displaced item:", {
          itemToMove,
          newPosition: availablePos - 1,
          currentArray: [...result],
        });
      }
    }
  }
}

function reorderWithLockedItemsGeneric<T extends string | Card>(
  items: T[],
  oldIndex: number,
  newIndex: number,
  lockedItems: string[],
): T[] {
  console.log("Starting reorder:", {
    items: [...items],
    oldIndex,
    newIndex,
    lockedItems: [...lockedItems],
  });

  if (
    lockedItems.length === 0 ||
    !items
      .slice(Math.min(oldIndex, newIndex), Math.max(oldIndex, newIndex) + 1)
      .some((item) => lockedItems.includes(getItem(item)))
  ) {
    console.log("Simple move, no locked item in between");
    return arrayMove(items, oldIndex, newIndex);
  }

  // If the moved item is locked, return original array
  const itemId = getItem(items[oldIndex]);
  if (lockedItems.includes(itemId)) {
    console.log("Item is locked, returning original array");
    return items;
  }

  const result = [...items];

  const dummyItem =
    typeof items[0] === "string"
      ? ("dummy" as T)
      : ({ id: "dummy", title: "Dummy Item" } as T);

  const [movedItem] = result.splice(oldIndex, 1, dummyItem);
  console.log("Removed moved item:", { movedItem, currentArray: [...result] });

  // Moving right to left
  if (oldIndex > newIndex) {
    console.log("Moving right to left");

    // Check if we're trying to move to position right after a locked item
    if (lockedItems.includes(getItem(items[newIndex]))) {
      console.log("Target position is after locked item");
      const lockedIndex = findItemIndex(result, items[newIndex]);

      // Get and remove the item that was after the locked item
      const itemAfterLocked = result[lockedIndex - 1];
      if (itemAfterLocked === undefined) {
        console.log("Locked item is first in list, forbidden move");
        return items;
      }
      result.splice(lockedIndex - 1, 1);
      console.log("Removed item after locked:", {
        itemAfterLocked,
        currentArray: [...result],
      });

      // Insert moved item after original adjacent item
      result.splice(lockedIndex - 1, 0, movedItem);
      console.log("Inserted moved item:", { currentArray: [...result] });

      // Insert original adjacent item before locked item
      result.splice(lockedIndex, 0, itemAfterLocked);
      console.log("Inserted original adjacent item:", {
        currentArray: [...result],
      });
    } else {
      // Insert at the target position
      result.splice(newIndex, 0, movedItem);
      console.log("Inserted at target position:", {
        currentArray: [...result],
      });
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
    console.log("Moving left to right");

    // Check if we're trying to move to position right after a locked item
    if (lockedItems.includes(getItem(items[newIndex]))) {
      console.log("Target position is after locked item");
      const lockedIndex = findItemIndex(result, items[newIndex]);

      // Get and remove the item that was after the locked item
      const itemAfterLocked = result[lockedIndex + 1];
      if (itemAfterLocked === undefined) {
        console.log("Locked item is last in list, forbidden move");
        return items;
      }
      result.splice(lockedIndex + 1, 1);
      console.log("Removed item after locked:", {
        itemAfterLocked,
        currentArray: [...result],
      });

      // Insert moved item after original adjacent item
      result.splice(lockedIndex + 1, 0, movedItem);
      console.log("Inserted moved item:", { currentArray: [...result] });

      // Insert original adjacent item before locked item
      result.splice(lockedIndex, 0, itemAfterLocked);
      console.log("Inserted original adjacent item:", {
        currentArray: [...result],
      });
    } else {
      // Insert at the target position
      result.splice(newIndex + 1, 0, movedItem);
      console.log("Inserted at target position:", {
        currentArray: [...result],
      });
    }

    // Push displaced items backward past any locked items
    pushItemsBackwardPastLocks(result, oldIndex, newIndex, lockedItems);
  }

  console.log("Final result:", [...result]);
  return result;
}

function reorderOverSectionWithLockedItemsGeneric<T extends string | Card>(
  items: T[],
  oldIndex: number,
  newIndex: number,
  lockedItems: string[],
): T[] {
  console.log("Starting reorder:", {
    items: [...items],
    oldIndex,
    newIndex,
    lockedItems: [...lockedItems],
  });

  const movedOverSectionCards = arrayMove(items, oldIndex, newIndex);

  if (
    lockedItems.length === 0 ||
    !movedOverSectionCards
      .slice(newIndex, movedOverSectionCards.length - 1)
      .some((item) => lockedItems.includes(getItem(item)))
  ) {
    console.log("Simple move, no locked item in between");
    return movedOverSectionCards;
  }

  // If the moved item is locked, return original array
  const itemId = getItem(movedOverSectionCards[oldIndex]);
  if (lockedItems.includes(itemId)) {
    console.log("Item is locked, returning original array");
    return movedOverSectionCards;
  }

  const result = [...movedOverSectionCards];

  pushItemsForwardPastLocksSimple(result, oldIndex, newIndex, lockedItems);

  if (!checkLockedItemsMoved(items, movedOverSectionCards, lockedItems)) {
    console.log("Locked items have changed, return original board");
    return items;
  }

  console.log("Final result:", [...result]);
  return result;
}

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
  newIndex: number,
  lockedItems: string[],
): string[] =>
  reorderOriginalSectionWithLockedItemsGeneric(
    items,
    oldIndex,
    newIndex,
    lockedItems,
  );

const reorderOriginalSectionWithLockedItemsArray = <T extends Card>(
  items: T[],
  oldIndex: number,
  newIndex: number,
  lockedItems: string[],
): T[] =>
  reorderOriginalSectionWithLockedItemsGeneric(
    items,
    oldIndex,
    newIndex,
    lockedItems,
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
