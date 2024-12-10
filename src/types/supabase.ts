export interface User {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  title: string;
  content: string;
  category: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  title: string;
  client_id: string;
  template_id: string;
  status: 'draft' | 'em_revisao' | 'assinado' | 'cancelado';
  content: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  contract_id: string;
  version_number: number;
  content: string;
  created_by: string | null;
  created_at: string;
}

// Tipos para respostas da API
export type ApiResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Enums úteis
export enum ContractStatus {
  DRAFT = 'draft',
  EM_REVISAO = 'em_revisao',
  ASSINADO = 'assinado',
  CANCELADO = 'cancelado'
}
