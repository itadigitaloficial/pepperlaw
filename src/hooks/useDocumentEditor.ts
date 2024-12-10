import { useState, useCallback } from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import mammoth from 'mammoth';
import html2pdf from 'html2pdf.js';

export const useDocumentEditor = (initialContent: string = '') => {
  const [content, setContent] = useState(initialContent);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setContent(result.value);
    } catch (error) {
      console.error('Error reading document:', error);
      throw new Error('Erro ao ler o documento. Por favor, tente novamente.');
    }
  }, []);

  const handleSaveDocx = useCallback(async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun(content)],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'documento-editado.docx');
  }, [content]);

  const handleSavePdf = useCallback(async () => {
    const element = document.createElement('div');
    element.innerHTML = content;
    
    const opt = {
      margin: 1,
      filename: 'documento-editado.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Erro ao gerar PDF. Por favor, tente novamente.');
    }
  }, [content]);

  const clearContent = useCallback(() => {
    setContent('');
  }, []);

  return {
    content,
    setContent,
    handleFileUpload,
    handleSaveDocx,
    handleSavePdf,
    clearContent,
  };
};