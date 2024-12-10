import React from 'react';

interface EditorContentProps {
  content: string;
  onChange: (content: string) => void;
}

export const EditorContent: React.FC<EditorContentProps> = ({ content, onChange }) => {
  return (
    <div className="border rounded-lg shadow-sm bg-white">
      <div
        contentEditable
        className="prose max-w-none p-6 min-h-[600px]"
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};