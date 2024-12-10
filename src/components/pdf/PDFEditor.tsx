import React, { useRef, useState, useEffect } from 'react';
import * as fabric from 'fabric';
import { PDFDocument } from 'pdf-lib';
import { Snackbar, Alert, IconButton, Tooltip } from '@mui/material';
import { 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut,
  Save,
  AddBox,
  Draw,
  Today,
  CheckBox
} from '@mui/icons-material';
import { PDFPageManager } from './PDFPageManager';
import { useHistory } from '../../hooks/useHistory';
import { 
  Field, 
  validateAllFields, 
  ValidationError,
  commonValidations 
} from '../../utils/fieldValidation';

interface PDFEditorProps {
  pdfUrl?: string;
}

interface CanvasState {
  objects: any[];
  fields: Field[];
}

export const PDFEditor: React.FC<PDFEditorProps> = ({ pdfUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { 
    state: canvasState,
    set: setCanvasState,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistory<CanvasState>({ objects: [], fields: [] });

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: '#f0f0f0',
        width: 800,
        height: 1130,
      });

      canvas.on('object:modified', () => {
        saveCanvasState(canvas);
      });

      setFabricCanvas(canvas);

      return () => {
        canvas.dispose();
      };
    }
  }, []);

  const saveCanvasState = (canvas: fabric.Canvas) => {
    const objects = canvas.toJSON().objects;
    const fields = canvas.getObjects().map((obj: any) => ({
      id: obj.id || Math.random().toString(36).substr(2, 9),
      type: obj.type,
      label: obj.text || '',
      value: obj.value || '',
      validation: obj.data?.validation,
      x: obj.left,
      y: obj.top,
      width: obj.width,
      height: obj.height,
      page: currentPage,
    }));

    setCanvasState({ objects, fields });
  };

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
        data: {
          validation: {
            required: true,
            minLength: 3,
          },
        },
      });

      fabricCanvas.add(textbox);
      fabricCanvas.setActiveObject(textbox);
      fabricCanvas.renderAll();
      saveCanvasState(fabricCanvas);
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
        data: {
          validation: {
            required: true,
          },
        },
      });

      fabricCanvas.add(group);
      fabricCanvas.setActiveObject(group);
      fabricCanvas.renderAll();
      saveCanvasState(fabricCanvas);
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
        data: {
          validation: {
            required: true,
            pattern: commonValidations.date.pattern,
          },
        },
      });

      fabricCanvas.add(textbox);
      fabricCanvas.setActiveObject(textbox);
      fabricCanvas.renderAll();
      saveCanvasState(fabricCanvas);
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
        data: {
          validation: {
            required: true,
          },
        },
      });

      fabricCanvas.add(checkbox);
      fabricCanvas.setActiveObject(checkbox);
      fabricCanvas.renderAll();
      saveCanvasState(fabricCanvas);
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
      const errors = validateAllFields(canvasState.fields);
      
      if (errors.length > 0) {
        setErrors(errors);
        setErrorMessage('Existem campos obrigatórios não preenchidos');
        setShowError(true);
        return;
      }

      const json = fabricCanvas.toJSON();
      // Aqui você pode salvar o estado do canvas no Supabase
      console.log('Canvas state:', json);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-100 p-4 border-r">
        <div className="space-y-4">
          <div className="flex justify-between mb-4">
            <Tooltip title="Desfazer">
              <IconButton onClick={undo} disabled={!canUndo}>
                <Undo />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refazer">
              <IconButton onClick={redo} disabled={!canRedo}>
                <Redo />
              </IconButton>
            </Tooltip>
          </div>

          <Tooltip title="Adicionar Campo de Texto">
            <button
              onClick={addTextField}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
            >
              <AddBox className="mr-2" />
              Campo de Texto
            </button>
          </Tooltip>

          <Tooltip title="Adicionar Campo de Assinatura">
            <button
              onClick={addSignatureField}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
            >
              <Draw className="mr-2" />
              Assinatura
            </button>
          </Tooltip>

          <Tooltip title="Adicionar Data">
            <button
              onClick={addDateField}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
            >
              <Today className="mr-2" />
              Data
            </button>
          </Tooltip>

          <Tooltip title="Adicionar Checkbox">
            <button
              onClick={addCheckbox}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
            >
              <CheckBox className="mr-2" />
              Checkbox
            </button>
          </Tooltip>

          <div className="flex justify-between mt-4">
            <Tooltip title="Diminuir Zoom">
              <IconButton onClick={handleZoomOut}>
                <ZoomOut />
              </IconButton>
            </Tooltip>
            <span className="py-2">{Math.round(scale * 100)}%</span>
            <Tooltip title="Aumentar Zoom">
              <IconButton onClick={handleZoomIn}>
                <ZoomIn />
              </IconButton>
            </Tooltip>
          </div>

          <Tooltip title="Salvar">
            <button
              onClick={handleSave}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mt-4 flex items-center justify-center"
            >
              <Save className="mr-2" />
              Salvar
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="relative">
          {pdfUrl && (
            <PDFPageManager
              pdfUrl={pdfUrl}
              scale={scale}
              onPageChange={handlePageChange}
              currentPage={currentPage}
              numPages={numPages}
            />
          )}
          <canvas ref={canvasRef} className="absolute top-0 left-0" />
        </div>
      </div>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
      >
        <Alert onClose={() => setShowError(false)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};
