export interface ContractData {
  id: string;
  title: string;
  type: string;
  parties: {
    firstParty: Party;
    secondParty: Party;
  };
  clauses: ContractClause[];
  date: string;
  value?: string;
  duration?: string;
  status: 'draft' | 'active' | 'pending' | 'finished';
  lastModified: string;
}

export interface Party {
  name: string;
  document: string;
  address: string;
  type: 'individual' | 'company';
}

export interface ContractClause {
  id: string;
  title: string;
  content: string;
  isRequired: boolean;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  defaultClauses: ContractClause[];
  category: string;
}