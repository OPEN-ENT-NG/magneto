// Tooltip.tsx
import { FC } from "react";

import { Tooltip as TooltipLIBUI } from "@cgi-learning-hub/ui";

import { TooltipProps } from "./types";

export const Tooltip: FC<TooltipProps> = ({
  children,
  title,
  placement,
  width = "20rem",
  arrow = false,
  fontSize = "1.4rem",
  offsetY = -0.4,
  useSlotPropsOffset = false,
}) => {
  return (
    <TooltipLIBUI
      arrow={arrow}
      title={title}
      {...(placement && { placement })}
      {...(!useSlotPropsOffset && {
        TransitionProps: {
          style: { marginTop: `${offsetY}rem` },
        },
      })}
      {...(useSlotPropsOffset && {
        slotProps: {
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, offsetY * -10],
                },
              },
            ],
          },
        },
      })}
      componentsProps={{
        tooltip: {
          sx: {
            fontSize: fontSize,
            width: { width },
            maxWidth: "none",
          },
        },
      }}
    >
      {children}
    </TooltipLIBUI>
  );
};
