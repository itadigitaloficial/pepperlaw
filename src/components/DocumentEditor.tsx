import React from 'react';
import { EditorLayout } from './editor/EditorLayout';
import { ContractTemplate } from '../types/contract';

const SAMPLE_TEMPLATES: ContractTemplate[] = [
  {
    id: '1',
    name: 'Contrato de Prestação de Serviços',
    description: 'Modelo padrão para prestação de serviços',
    category: 'Serviços',
    defaultClauses: [],
  },
  {
    id: '2',
    name: 'Contrato de Compra e Venda',
    description: 'Modelo para transações comerciais',
    category: 'Comercial',
    defaultClauses: [],
  },
  {
    id: '3',
    name: 'Contrato de Locação',
    description: 'Modelo para locação de imóveis',
    category: 'Imobiliário',
    defaultClauses: [],
  },
];

interface DocumentEditorProps {
  initialContent?: string;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ initialContent = '' }) => {
  return (
    <div className="h-screen bg-gray-100">
      <EditorLayout templates={SAMPLE_TEMPLATES} initialContent={initialContent} />
    </div>
  );
};