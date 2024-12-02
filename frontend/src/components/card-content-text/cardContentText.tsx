import { FC } from "react";

import { Box } from "@mui/material";
import DOMPurify from "dompurify";
import katex from "katex";

import "katex/dist/katex.min.css";
import { textWrapperStyle } from "./style";
import { CardContentTextProps } from "./types";

const additionalStyles = `
  table {
    border-collapse: collapse;
    border-spacing: 0;
    min-width: 75px;
    width: 100%;
  }
  td, th {
    border: 1px solid #ddd;
    padding: 8px;
  }
  th {
    background-color: #f4f4f4;
  }
  p {
    margin: 0;
  }
`;
declare module "dompurify" {
  interface Config {
    ALLOWED_STYLES?: string[];
  }
}

export const CardContentText: FC<CardContentTextProps> = ({ text }) => {
  // Traiter les formules mathématiques
  const processText = (html: string) => {
    // Remplacer les formules mathématiques
    return html.replace(/\$([^$]+)\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula, {
          throwOnError: false,
          displayMode: false,
        });
      } catch (e) {
        console.error("KaTeX error:", e);
        return match;
      }
    });
  };

  const cleanHtml = DOMPurify.sanitize(text, {
    ADD_TAGS: [
      "iframe",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "col",
      "colgroup",
      "p",
      "style",
      "span", // span pour KaTeX
    ],
    ADD_ATTR: [
      "style",
      "colspan",
      "rowspan",
      "class", // class pour KaTeX
    ],
    ALLOWED_STYLES: [
      "minWidth",
      "min-width",
      "width",
      "height",
      "border",
      "padding",
      "margin",
      "background",
      "color",
      "text-align",
    ],
  });

  const processedHtml = processText(cleanHtml);

  return (
    <Box sx={textWrapperStyle}>
      <style>{additionalStyles}</style>
      <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
    </Box>
  );
};
