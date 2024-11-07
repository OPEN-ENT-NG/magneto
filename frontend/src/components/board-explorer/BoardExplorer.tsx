import React, { FC, useEffect } from "react";
import "./BoardExplorer.scss";
import { Button } from "@edifice-ui/react";
import { Box } from "@mui/material";
import { useBoard } from "~/providers/BoardProvider";
import { useElapsedTime } from "~/hooks/useElapsedTime";
import DOMPurify from "dompurify";
import {
  useGetPDFFileQuery,
  useLazyGetPDFFileQuery,
} from "~/services/api/workspace.service";
import SecureIFrame from "../secure-iframe/SecureIFrame";
import PDFUploadViewer from "../PdfUploadViewer/PdfUploadViewer";

export const retourStyle = {
  position: "fixed",
  right: "6%",
  transform: "translateX(20%)",
} as React.CSSProperties;

export const boxStyle = {
  padding: "1rem 0",
  position: "relative",
  overflow: "visible", // Permet au bouton de dépasser
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
} as React.CSSProperties;

export const BoardExplorer: FC = () => {
  const { board } = useBoard();
  const actualCard = board.cards[0];

  return (
    <div>
      <Box sx={boxStyle}>
        {actualCard?.id && <PDFUploadViewer id={actualCard.resourceId} />}
      </Box>
    </div>
  );
};
