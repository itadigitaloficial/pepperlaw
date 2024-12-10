import React from 'react';
import { TableModule } from './modules/TableModule';
import { ImageModule } from './modules/ImageModule';
import { LinkModule } from './modules/LinkModule';

interface EditorToolbarProps {
  editor: any;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const handleTableInsert = (rows: number, cols: number) => {
    if (editor) {
      const tableModule = editor.getModule('table');
      tableModule.insertTable(rows, cols);
    }
  };

  const handleImageInsert = (file: File) => {
    if (editor) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const range = editor.getSelection(true);
        editor.insertEmbed(range.index, 'image', e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLinkInsert = (url: string, text: string) => {
    if (editor) {
      const range = editor.getSelection(true);
      editor.insertText(range.index, text, 'link', url);
    }
  };

  return (
    <div className="border-b border-gray-200 p-2 flex space-x-2">
      <TableModule onInsertTable={handleTableInsert} />
      <ImageModule onImageInsert={handleImageInsert} />
      <LinkModule onLinkInsert={handleLinkInsert} />
    </div>
  );
};