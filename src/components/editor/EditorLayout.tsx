import React from 'react';
import { DocumentToolbar } from './DocumentToolbar';
import { RichTextEditor } from './RichTextEditor';
import { EditorSidebar } from './EditorSidebar';
import { useDocumentEditor } from '../../hooks/useDocumentEditor';
import { ContractTemplate } from '../../types/contract';

interface EditorLayoutProps {
  templates: ContractTemplate[];
  initialContent?: string;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({ 
  templates,
  initialContent = ''
}) => {
  const {
    content,
    setContent,
    handleFileUpload,
    handleSaveDocx,
    handleSavePdf,
    clearContent,
  } = useDocumentEditor(initialContent);

  return (
    <div className="h-screen flex overflow-hidden">
      <EditorSidebar 
        templates={templates} 
        onTemplateSelect={(template) => {
          setContent(`<h1>${template.name}</h1><p>${template.description}</p>`);
        }} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <DocumentToolbar
              onUpload={handleFileUpload}
              onSaveDocx={handleSaveDocx}
              onSavePdf={handleSavePdf}
              onNewDocument={clearContent}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <RichTextEditor content={content} onChange={setContent} />
          </div>
        </div>
      </div>
    </div>
  );
};