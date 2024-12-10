import React, { useRef } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface ImageModuleProps {
  onImageInsert: (file: File) => void;
}

export const ImageModule: React.FC<ImageModuleProps> = ({ onImageInsert }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageInsert(file);
    }
  };

  return (
    <>
      <button
        className="p-2 hover:bg-gray-100 rounded"
        onClick={handleClick}
        title="Inserir imagem"
      >
        <PhotoIcon className="h-5 w-5" />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </>
  );
};