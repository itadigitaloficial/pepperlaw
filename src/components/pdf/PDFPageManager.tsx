import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { IconButton, Pagination } from '@mui/material';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';

interface PDFPageManagerProps {
  pdfUrl: string;
  scale: number;
  onPageChange: (pageNumber: number) => void;
  currentPage: number;
  numPages: number;
}

export const PDFPageManager: React.FC<PDFPageManagerProps> = ({
  pdfUrl,
  scale,
  onPageChange,
  currentPage,
  numPages,
}) => {
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value);
  };

  return (
    <div className="flex flex-col items-center">
      <Document file={pdfUrl}>
        <Page
          pageNumber={currentPage}
          scale={scale}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          className="shadow-lg"
        />
      </Document>
      
      <div className="flex items-center mt-4 space-x-4">
        <IconButton 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
        >
          <NavigateBefore />
        </IconButton>
        
        <Pagination 
          count={numPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          size="large"
        />
        
        <IconButton
          onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
          disabled={currentPage >= numPages}
        >
          <NavigateNext />
        </IconButton>
      </div>
    </div>
  );
};
