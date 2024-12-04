import { Box, styled } from "@mui/material";

export const mainBox = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  margin: "0 auto",
  padding: "1.5rem 0",
  overflow: "hidden",
};

export const documentBox = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "500px",
  width: "100%",
  overflow: "hidden",
};

export const loadingBox = {
  display: "flex",
  justifyContent: "center",
  padding: "1rem",
};

export const DocumentBox = styled(Box)<{
  isLandscape: boolean;
}>(({ isLandscape }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  overflow: "hidden",

  ...(isLandscape
    ? {
        minHeight: "auto",
        maxHeight: "70vh",
        "& .react-pdf__Document": {
          display: "flex",
          justifyContent: "center",
          width: "100%",
          overflow: "hidden",
        },
        "& .react-pdf__Page": {
          maxWidth: "100%",
          width: "100%",
          height: "auto !important",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",

          "& .react-pdf__Page__canvas": {
            maxWidth: "100% !important",
            width: "100% !important",
            height: "auto !important",
            objectFit: "contain",
            maxHeight: "70vh",
          },
        },
      }
    : {
        minHeight: "500px",
        width: "100%",
        "& .react-pdf__Page": {
          maxWidth: "100%",
          overflow: "hidden",
        },
      }),
}));
