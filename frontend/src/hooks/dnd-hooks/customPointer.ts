import { PointerSensor, PointerSensorOptions } from "@dnd-kit/core";

export class CustomPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as const,
      handler: (
        event: React.PointerEvent,
        { onActivation }: PointerSensorOptions,
      ): boolean => {
        if (!(event.target instanceof Element)) {
          return false;
        }

        const dropdownOpen = document.querySelector(
          '[data-dropdown-open="true"]',
        );
        if (dropdownOpen) {
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
