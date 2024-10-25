import { PointerSensor } from "@dnd-kit/core";

import { CustomPointerSensorOptions, DND_ITEM_TYPE } from "./types";

export class CustomPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as const,
      handler: (
        event: React.PointerEvent,
        { onActivation, isLoading }: CustomPointerSensorOptions,
      ): boolean => {
        if (isLoading) {
          return false;
        }

        if (!(event.target instanceof Element)) {
          return false;
        }

        const dropdownOpen = document.querySelector(
          '[data-dropdown-open="true"]',
        );

        const isNonDraggable =
          event.target.closest(
            `[data-type="${DND_ITEM_TYPE.NON_DRAGGABLE}"]`,
          ) !== null;

        if (dropdownOpen || isNonDraggable) {
          return false;
        }

        const shouldActivate = !event.isPrimary || event.button === 0;
        if (shouldActivate) {
          onActivation?.({ event: event.nativeEvent });
        }

        return shouldActivate;
      },
    },
  ];
}
