import React, { FC } from "react";
import "./BoardExplorer.scss";
import { Button } from "@edifice-ui/react";
import { Box } from "@mui/material";
import { useBoard } from "~/providers/BoardProvider";
import { useElapsedTime } from "~/hooks/useElapsedTime";
import { CardContentText } from "../card-content-text/cardContentText";
import DOMPurify from "dompurify";

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
  const time = useElapsedTime(actualCard?.modificationDate);

  return (
    <div>
      <Box sx={boxStyle}>
        <div>
          <h1>Mon en-tête</h1>
        </div>
        <Button
          color="primary"
          type="submit"
          variant="filled"
          className="retour-button"
          onClick={() => console.log("retour")}
          style={retourStyle}
        >
          {"<- Retour"}
        </Button>
      </Box>
      <Box sx={{ marginBottom: "10rem" }}>
        <span>
          Crée par {actualCard?.ownerName}, modifié par{" "}
          {actualCard?.lastModifierName ?? actualCard?.ownerName}
        </span>
        <span> {time.label}</span>
      </Box>
      <Box sx={{ marginBottom: "10rem" }}>STUB CONTENT</Box>
      <Box
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(actualCard?.description),
        }}
      />
      <Box>
        <span>{actualCard?.caption}</span>
      </Box>
    </div>
  );
};
