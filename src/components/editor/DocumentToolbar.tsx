import React from 'react';
import { Menu } from '@headlessui/react';
import { 
  DocumentIcon, 
  CloudArrowUpIcon, 
  CloudArrowDownIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

interface DocumentToolbarProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSaveDocx: () => Promise<void>;
  onSavePdf: () => Promise<void>;
  onNewDocument: () => void;
}

export const DocumentToolbar: React.FC<DocumentToolbarProps> = ({
  onUpload,
  onSaveDocx,
  onSavePdf,
  onNewDocument,
}) => {
  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={onNewDocument}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <DocumentIcon className="h-5 w-5 mr-2" />
            Novo Documento
          </button>
          <label className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
            Upload
            <input type="file" className="hidden" accept=".docx" onChange={onUpload} />
          </label>
        </div>
        <Menu as="div" className="relative">
          <Menu.Button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Exportar
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onSaveDocx}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                >
                  <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                  Exportar como DOCX
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onSavePdf}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                >
                  <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                  Exportar como PDF
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
    </div>
  );
};