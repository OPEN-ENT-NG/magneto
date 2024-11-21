import { useState, FC } from "react";
import { Document, Page, pdfjs } from "react-pdf";
// Import correct du worker pour Vite
import "pdfjs-dist/build/pdf.worker.min";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "./PdfUploadViewer.scss";
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

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export const PDFUploadViewer: FC<PDFUploadViewerProps> = ({ url }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

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
    <Box sx={{ width: "100%", maxWidth: "lg", mx: "auto", p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Navigation Controls */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{ mb: 3 }}
        >
          <IconButton
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
            color="primary"
          >
            <PreviousIcon />
          </IconButton>

          <Typography>
            Page {pageNumber} of {numPages || "--"}
          </Typography>

          <IconButton
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
            color="primary"
          >
            <NextIcon />
          </IconButton>
        </Stack>

        {/* Document Viewer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "500px",
          }}
        >
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            error={
              <Typography color="error" sx={{ p: 2 }}>
                An error occurred while loading the PDF!
              </Typography>
            }
            loading={
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            }
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
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
