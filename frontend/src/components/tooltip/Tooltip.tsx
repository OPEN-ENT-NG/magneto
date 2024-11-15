import { FC } from "react";

import { Tooltip as TooltipMUI } from "@mui/material";

import { TooltipProps } from "./types";

export const Tooltip: FC<TooltipProps> = ({
  children,
  title,
  placement,
  width = "20rem",
}) => {
  return (
    <TooltipMUI
      title={title}
      {...(placement && { placement })}
      TransitionProps={{
        style: { marginTop: "-0.4rem" },
      }}
      componentsProps={{
        tooltip: {
          sx: {
            fontSize: "1.4rem",
            width: { width },
            maxWidth: "none",
          },
        },
      }}
    >
      {children}
    </TooltipMUI>
  );
};
