import DOMPurify from "dompurify";
import React, { FC, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url,
).toString();

interface EmbedProps {
  src: string;
}

const SecureIFrame: FC<EmbedProps> = ({ src }) => {
  const [embedSrc, setEmbedSrc] = useState("");
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  const onDocumentLoadSuccess = (numPages: number) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    const sanitizedUrl = sanitizeUrl(src);
    setEmbedSrc(sanitizedUrl);
  }, [src]);

  return (
    <div>
      <Document file={embedSrc} onLoadSuccess={() => onDocumentLoadSuccess}>
        <Page pageNumber={pageNumber} />
      </Document>
      <p>
        Page {pageNumber} of {numPages}
      </p>
    </div>
  );
};

function sanitizeUrl(url: string): string {
  return DOMPurify.sanitize(url);
}

export default SecureIFrame;
