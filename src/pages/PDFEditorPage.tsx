import React, { useState } from 'react';
import { PDFEditor } from '../components/pdf/PDFEditor';
import { PDFUploader } from '../components/pdf/PDFUploader';

export const PDFEditorPage: React.FC = () => {
  const [selectedPDF, setSelectedPDF] = useState<string | null>(null);

  const handlePDFSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setSelectedPDF(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!selectedPDF ? (
        <div className="max-w-3xl mx-auto py-12 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Editor de PDF
          </h1>
          <PDFUploader onPDFSelect={handlePDFSelect} />
        </div>
      ) : (
        <PDFEditor pdfUrl={selectedPDF} />
      )}
    </div>
  );
};
