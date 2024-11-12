import React, { FC } from "react";
import "./BoardExplorer.scss";
import { Button } from "@edifice-ui/react";
import { Box } from "@mui/material";
import { ExplorerFileViewer } from "../explorer-file-viewer/ExplorerFileViewer";

export const retourStyle = {
  position: "relative",
  right: "-1rem",
  marginRight: "1rem",
} as React.CSSProperties;

export const BoardExplorer: FC = () => {
  return (
    <div className="container-fluid">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 0",
          position: "relative",
        }}
      >
        <h1>Mon en-tête</h1>
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "-10rem",
            transform: "translateY(-50%)",
          }}
        >
          <Button
            color="primary"
            type="submit"
            variant="filled"
            className="retourStyle"
            onClick={() => console.log("retour")}
            style={{
              marginRight: "1rem",
            }}
          >
            {"<- Retour"}
          </Button>
        </div>
      </div>
      <iframe src="/workspace/document/d4d8f327-382d-4be1-8a29-88b84498d8d9"></iframe>
      <ExplorerFileViewer
        file={"/workspace/document/d4d8f327-382d-4be1-8a29-88b84498d8d9"}
        type={"DOCX"}
      />
    </div>
  );
};
