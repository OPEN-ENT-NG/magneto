import { cloneElement, FC, isValidElement } from "react";

import { Box } from "@mui/material";
import DOMPurify from "dompurify";
import ReactHtmlParser, {
  convertNodeToElement,
  Transform,
} from "react-html-parser";

import { textWrapperStyle } from "./style";
import { CardContentTextProps } from "./types";

export const CardContentText: FC<CardContentTextProps> = ({ text }) => {
  const cleanHtml = DOMPurify.sanitize(text);

  const transform: Transform = (node, index) => {
    if (node.type === "tag" && node.name === "a") {
      const element = convertNodeToElement(node, index, transform);
      if (isValidElement(element)) {
        return cloneElement(element);
      }
    }
    return undefined;
  };

  const parsedContent = ReactHtmlParser(cleanHtml, { transform });

  return <Box sx={textWrapperStyle}>{parsedContent}</Box>;
};
