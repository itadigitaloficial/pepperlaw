import React, { useRef, useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { PDFDocument } from 'pdf-lib';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFEditorProps {
  pdfUrl?: string;
}

export const PDFEditor: React.FC<PDFEditorProps> = ({ pdfUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: '#f0f0f0',
        width: 800,
        height: 1130, // Aproximadamente tamanho A4
      });
      setFabricCanvas(canvas);

      return () => {
        canvas.dispose();
      };
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const addTextField = () => {
    if (fabricCanvas) {
      const textbox = new fabric.Textbox('Digite aqui...', {
        left: 50,
        top: 50,
        width: 200,
        fontSize: 16,
        fill: '#000000',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
      });
      fabricCanvas.add(textbox);
      fabricCanvas.setActiveObject(textbox);
    }
  };

  const addSignatureField = () => {
    if (fabricCanvas) {
      const rect = new fabric.Rect({
        left: 50,
        top: 50,
        width: 200,
        height: 50,
        fill: 'rgba(200, 200, 200, 0.3)',
        stroke: '#999999',
        strokeWidth: 1,
      });

      const text = new fabric.Text('Assinatura', {
        left: 70,
        top: 65,
        fontSize: 14,
        fill: '#999999',
      });

      const group = new fabric.Group([rect, text], {
        selectable: true,
        hasControls: true,
      });

      fabricCanvas.add(group);
      fabricCanvas.setActiveObject(group);
    }
  };

  const addDateField = () => {
    if (fabricCanvas) {
      const textbox = new fabric.Textbox(new Date().toLocaleDateString(), {
        left: 50,
        top: 50,
        width: 150,
        fontSize: 16,
        fill: '#000000',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
      });
      fabricCanvas.add(textbox);
      fabricCanvas.setActiveObject(textbox);
    }
  };

  const addCheckbox = () => {
    if (fabricCanvas) {
      const size = 20;
      const checkbox = new fabric.Rect({
        left: 50,
        top: 50,
        width: size,
        height: size,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 1,
      });

      fabricCanvas.add(checkbox);
      fabricCanvas.setActiveObject(checkbox);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleSave = async () => {
    if (fabricCanvas) {
      const json = fabricCanvas.toJSON();
      // Aqui você pode salvar o estado do canvas no Supabase
      console.log('Canvas state:', json);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-100 p-4 border-r">
        <div className="space-y-4">
          <button
            onClick={addTextField}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Adicionar Campo de Texto
          </button>
          <button
            onClick={addSignatureField}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Adicionar Campo de Assinatura
          </button>
          <button
            onClick={addDateField}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Adicionar Data
          </button>
          <button
            onClick={addCheckbox}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Adicionar Checkbox
          </button>
          <div className="flex justify-between mt-4">
            <button
              onClick={handleZoomOut}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              -
            </button>
            <span className="py-2">{Math.round(scale * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              +
            </button>
          </div>
          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mt-4"
          >
            Salvar
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="relative">
          {pdfUrl && (
            <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </Document>
          )}
          <canvas ref={canvasRef} className="absolute top-0 left-0" />
        </div>
      </div>
    </div>
  );
};
