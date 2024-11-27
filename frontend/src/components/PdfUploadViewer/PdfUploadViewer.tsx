import { useState, FC } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "pdfjs-dist/build/pdf.worker.min";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import {
  Box,
  Paper,
  Typography,
  Stack,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  NavigateBefore as PreviousIcon,
  NavigateNext as NextIcon,
} from "@mui/icons-material";
import { PDFUploadViewerProps } from "./types";
import { documentBox, loadingBox, mainBox } from "./style";
import { useTranslation } from "react-i18next";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export const PDFUploadViewer: FC<PDFUploadViewerProps> = ({ url }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const { t } = useTranslation("magneto");

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPreviousPage = () => {
    setPageNumber((prevPage) => Math.max(prevPage - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prevPage) => Math.min(prevPage + 1, numPages || prevPage));
  };

  return (
    <Box sx={mainBox}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{ pb: "2rem" }}
      >
        <IconButton
          onClick={goToPreviousPage}
          disabled={pageNumber <= 1}
          color="primary"
        >
          <PreviousIcon />
        </IconButton>

        <Typography sx={{ fontSize: "1.4rem" }}>
          Page {pageNumber} sur {numPages || "--"}
        </Typography>

        <IconButton
          onClick={goToNextPage}
          disabled={pageNumber >= (numPages || 1)}
          color="primary"
        >
          <NextIcon />
        </IconButton>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Box sx={documentBox}>
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            error={
              <Typography color="error" sx={{ p: 2 }}>
                {t("magneto.board.preview.pdf.error")}
              </Typography>
            }
            loading={
              <Box sx={loadingBox}>
                <CircularProgress />
              </Box>
            }
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              scale={1.6}
              loading={
                <Box sx={loadingBox}>
                  <CircularProgress />
                </Box>
              }
            />
          </Document>
        </Box>
      </Paper>
    </Box>
  );
};
