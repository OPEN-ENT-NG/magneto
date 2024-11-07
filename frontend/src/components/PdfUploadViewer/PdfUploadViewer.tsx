import { useState, ChangeEvent } from "react";
import { Document, Page, pdfjs } from "react-pdf";
// Import correct du worker pour Vite
import "pdfjs-dist/build/pdf.worker.min";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import {
  Box,
  Button,
  Paper,
  Typography,
  Stack,
  IconButton,
  CircularProgress,
  InputLabel,
  Input,
} from "@mui/material";
import {
  NavigateBefore as PreviousIcon,
  NavigateNext as NextIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFUploadViewer = (id) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [fileName, setFileName] = useState<string>("");
  console.log(id);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setFileName(file.name);
      setPageNumber(1);
      setNumPages(null);
    } else {
      alert("Please select a valid PDF file.");
      setPdfFile(null);
      setFileName("");
    }
  };

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
      {/* File Input */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2} alignItems="center">
          <Box>
            <InputLabel htmlFor="pdf-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadIcon />}
              >
                Select PDF
              </Button>
              <Input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                sx={{ display: "none" }}
              />
            </InputLabel>
          </Box>
          {fileName && (
            <Typography variant="body2" color="text.secondary">
              Selected file: {fileName}
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* PDF Viewer */}

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
              file={`/workspace/document/preview/${id.id}`}
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

export default PDFUploadViewer;
