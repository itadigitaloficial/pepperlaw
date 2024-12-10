import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface PDFUploaderProps {
  onPDFSelect: (file: File) => void;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onPDFSelect }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      onPDFSelect(file);
    }
  }, [onPDFSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed p-8 rounded-lg text-center cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 14v20c0 4.418 3.582 8 8 8h16c4.418 0 8-3.582 8-8V14m-4 0l-8-8-8 8m8-8v28"
          />
        </svg>
        <div className="text-gray-600">
          {isDragActive ? (
            <p>Solte o arquivo PDF aqui...</p>
          ) : (
            <p>Arraste e solte um arquivo PDF aqui, ou clique para selecionar</p>
          )}
        </div>
        <p className="text-xs text-gray-500">Apenas arquivos PDF são aceitos</p>
      </div>
    </div>
  );
};
