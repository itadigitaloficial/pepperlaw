import React from 'react';
import { Menu } from '@headlessui/react';
import { TableCellsIcon } from '@heroicons/react/24/outline';

interface TableModuleProps {
  onInsertTable: (rows: number, cols: number) => void;
}

export const TableModule: React.FC<TableModuleProps> = ({ onInsertTable }) => {
  const tableSizes = [
    { rows: 2, cols: 2 },
    { rows: 3, cols: 3 },
    { rows: 4, cols: 4 },
  ];

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="p-2 hover:bg-gray-100 rounded">
        <TableCellsIcon className="h-5 w-5" />
      </Menu.Button>
      <Menu.Items className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
        {tableSizes.map(({ rows, cols }) => (
          <Menu.Item key={`${rows}x${cols}`}>
            {({ active }) => (
              <button
                onClick={() => onInsertTable(rows, cols)}
                className={`${
                  active ? 'bg-gray-100' : ''
                } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
              >
                Tabela {rows}x{cols}
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
};