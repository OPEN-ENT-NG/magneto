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

function reorderWithLockedItemsGeneric<T extends string | Card>(
  items: T[],
  oldIndex: number,
  newIndex: number,
  lockedItems: string[],
): T[] {
  console.log("Starting reorder:", { items, oldIndex, newIndex, lockedItems });

  // If the moved item is locked, return original array
  const itemId = getItem(items[oldIndex]);
  if (lockedItems.includes(itemId)) {
    console.log("Item is locked, returning original array");
    return items;
  }

  const result = [...items];
  const [movedItem] = result.splice(oldIndex, 1);
  console.log("Removed moved item:", { movedItem, currentArray: result });

  // Moving right to left
  if (oldIndex > newIndex) {
    console.log("Moving right to left");

    // Check if we're trying to move to position right after a locked item
    if (lockedItems.includes(getItem(items[newIndex]))) {
      console.log("Target position is after locked item");
      const lockedIndex = findItemIndex(result, items[newIndex]);

      // Get and remove the item that was after the locked item
      const itemAfterLocked = result[lockedIndex - 1];
      result.splice(lockedIndex - 1, 1);
      console.log("Removed item after locked:", {
        itemAfterLocked,
        currentArray: result,
      });

      // Insert moved item after original adjacent item
      result.splice(lockedIndex - 1, 0, movedItem);
      console.log("Inserted moved item:", { currentArray: result });

      // Insert original adjacent item before locked item
      result.splice(lockedIndex, 0, itemAfterLocked);
      console.log("Inserted original adjacent item:", { currentArray: result });
    } else {
      // Insert at the target position
      result.splice(newIndex, 0, movedItem);
      console.log("Inserted at target position:", { currentArray: result });
    }

    // Push displaced items forward past any locked items
    for (let i = newIndex + 1; i < result.length; i++) {
      if (lockedItems.includes(getItem(result[i]))) {
        console.log("Found locked item while pushing forward:", {
          lockedItem: result[i],
        });

        // If we hit a locked item, find next available position
        let availablePos = i + 1;
        while (
          availablePos < result.length &&
          lockedItems.includes(getItem(result[availablePos]))
        ) {
          availablePos++;
        }

        if (availablePos < result.length) {
          // Move the displaced item to the available position
          const [itemToMove] = result.splice(i - 1, 1);
          result.splice(availablePos - 1, 0, itemToMove);
          console.log("Moved displaced item:", {
            itemToMove,
            newPosition: availablePos - 1,
            currentArray: result,
          });
        }
      }
    }
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
      result.splice(lockedIndex + 1, 1);
      console.log("Removed item after locked:", {
        itemAfterLocked,
        currentArray: result,
      });

      // Insert moved item after original adjacent item
      result.splice(lockedIndex + 1, 0, movedItem);
      console.log("Inserted moved item:", { currentArray: result });

      // Insert original adjacent item before locked item
      result.splice(lockedIndex, 0, itemAfterLocked);
      console.log("Inserted original adjacent item:", { currentArray: result });
    } else {
      // Insert at the target position
      result.splice(newIndex, 0, movedItem);
      console.log("Inserted at target position:", { currentArray: result });
    }

    // Push displaced items backward past any locked items
    for (let i = newIndex - 1; i >= 0; i--) {
      if (lockedItems.includes(getItem(result[i]))) {
        console.log("Found locked item while pushing backward:", {
          lockedItem: result[i],
        });

        // If we hit a locked item, find next available position
        let availablePos = i - 1;
        while (
          availablePos >= 0 &&
          lockedItems.includes(getItem(result[availablePos]))
        ) {
          availablePos--;
        }

        if (availablePos >= 0) {
          // Move the displaced item to the available position
          const [itemToMove] = result.splice(i + 1, 1);
          result.splice(availablePos + 1, 0, itemToMove);
          console.log("Moved displaced item:", {
            itemToMove,
            newPosition: availablePos + 1,
            currentArray: result,
          });
        }
      }
    }
  }

  console.log("Final result:", result);
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

export { reorderWithLockedItems, reorderWithLockedItemsArray };
