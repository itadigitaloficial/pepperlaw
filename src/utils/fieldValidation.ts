export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidation?: (value: string) => boolean;
}

export interface Field {
  id: string;
  type: 'text' | 'signature' | 'date' | 'checkbox';
  label: string;
  value: string;
  validation?: FieldValidation;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface ValidationError {
  fieldId: string;
  message: string;
}

export function validateField(field: Field): ValidationError | null {
  if (!field.validation) return null;

  const { required, minLength, maxLength, pattern, customValidation } = field.validation;
  const value = field.value.trim();

  if (required && !value) {
    return {
      fieldId: field.id,
      message: `${field.label} é obrigatório`,
    };
  }

  if (minLength && value.length < minLength) {
    return {
      fieldId: field.id,
      message: `${field.label} deve ter pelo menos ${minLength} caracteres`,
    };
  }

  if (maxLength && value.length > maxLength) {
    return {
      fieldId: field.id,
      message: `${field.label} deve ter no máximo ${maxLength} caracteres`,
    };
  }

  if (pattern && !pattern.test(value)) {
    return {
      fieldId: field.id,
      message: `${field.label} está em formato inválido`,
    };
  }

  if (customValidation && !customValidation(value)) {
    return {
      fieldId: field.id,
      message: `${field.label} não atende aos critérios de validação`,
    };
  }

  return null;
}

export function validateAllFields(fields: Field[]): ValidationError[] {
  return fields
    .map(validateField)
    .filter((error): error is ValidationError => error !== null);
}

// Validações predefinidas comuns
export const commonValidations = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    pattern: /^\(\d{2}\) \d{4,5}-\d{4}$/,
  },
  cpf: {
    pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  },
  cnpj: {
    pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  },
  date: {
    pattern: /^\d{2}\/\d{2}\/\d{4}$/,
  },
  cep: {
    pattern: /^\d{5}-\d{3}$/,
  },
};
