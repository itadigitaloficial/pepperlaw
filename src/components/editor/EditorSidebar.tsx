import React from 'react';
import { ContractTemplate } from '../../types/contract';
import { DocumentIcon } from '@heroicons/react/24/outline';

interface EditorSidebarProps {
  templates: ContractTemplate[];
  onTemplateSelect: (template: ContractTemplate) => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({ templates, onTemplateSelect }) => {
  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="h-0 flex-1 flex flex-col overflow-y-auto">
          <div className="px-4 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Modelos</h2>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-8">
            {categories.map(category => (
              <div key={category} className="space-y-2">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {category}
                </h3>
                <div className="space-y-1">
                  {templates
                    .filter(t => t.category === category)
                    .map(template => (
                      <button
                        key={template.id}
                        onClick={() => onTemplateSelect(template)}
                        className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50 w-full text-left"
                      >
                        <DocumentIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        <span className="truncate">{template.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};