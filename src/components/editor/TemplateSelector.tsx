import React from 'react';
import { ContractTemplate } from '../../types/contract';

interface TemplateSelectorProps {
  templates: ContractTemplate[];
  onSelect: (template: ContractTemplate) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, onSelect }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
      {templates.map((template) => (
        <div
          key={template.id}
          className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 cursor-pointer"
          onClick={() => onSelect(template)}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{template.name}</p>
            <p className="text-sm text-gray-500 truncate">{template.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};