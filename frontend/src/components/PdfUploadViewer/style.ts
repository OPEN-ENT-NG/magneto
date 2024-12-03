import { Box, styled } from "@mui/material";

export const mainBox = {
  width: "100% + 1rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  mr: "auto",
  ml: "auto",
  py: 3,
};

export const documentBox = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "500px",
};

export const loadingBox = { display: "flex", justifyContent: "center", p: 4 };

export const DocumentBox = styled(Box)<{
  isLandscape: boolean;
}>(({ isLandscape }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  ...(isLandscape
    ? {
        minHeight: "auto",
        maxHeight: "70vh",
        "& .react-pdf__Document": {
          display: "flex",
          justifyContent: "center",
          width: "100%",
        },
        "& .react-pdf__Page": {
          maxWidth: "80%",
          width: "80%",
          height: "auto !important",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          "& .react-pdf__Page__canvas": {
            width: "100% !important",
            height: "auto !important",
            objectFit: "contain",
            maxHeight: "70vh",
          },
        },
      }
    : {
        minHeight: "500px",
      }),
}));
