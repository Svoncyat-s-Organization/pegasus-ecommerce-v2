import type { DocumentType } from '@types';

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'DNI', label: 'DNI' },
  { value: 'CE', label: 'Carné de Extranjería' },
];

export const USER_STATUS = {
  ACTIVE: { text: 'Activo', color: 'success' },
  INACTIVE: { text: 'Inactivo', color: 'default' },
} as const;

export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
  hint: 'Mínimo 8 caracteres, debe incluir mayúscula, minúscula, número y carácter especial',
};
