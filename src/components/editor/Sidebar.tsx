import React from 'react';
import { ContractTemplate } from '../../types/contract';

interface SidebarProps {
  templates: ContractTemplate[];
  onTemplateSelect: (template: ContractTemplate) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ templates, onTemplateSelect }) => {
  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h2 className="text-lg font-semibold text-gray-900">Modelos</h2>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-8">
            {categories.map(category => (
              <div key={category}>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {category}
                </h3>
                <div className="mt-2 space-y-1">
                  {templates
                    .filter(t => t.category === category)
                    .map(template => (
                      <button
                        key={template.id}
                        onClick={() => onTemplateSelect(template)}
                        className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50 w-full text-left"
                      >
                        {template.name}
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