import { FC } from "react";

import { Box } from "@mui/material";
import DOMPurify from "dompurify";
import parse from "html-react-parser";

import { textWrapperStyle } from "./style";
import { CardContentTextProps } from "./types";

declare module "dompurify" {
  interface Config {
    ALLOWED_STYLES?: string[];
  }
}

export const CardContentText: FC<CardContentTextProps> = ({ text }) => {
  const cleanHtml = DOMPurify.sanitize(text, {
    ADD_TAGS: ["style"],
    ADD_ATTR: ["style"],
    ALLOWED_STYLES: [
      "color",
      "background-color",
      "font-family",
      "font-size",
      "text-align",
      "margin",
      "padding",
      "font-weight",
    ],
  });

  return (
    <Box
      sx={textWrapperStyle}
    >
      {parse(cleanHtml)}
    </Box>
  );
};
