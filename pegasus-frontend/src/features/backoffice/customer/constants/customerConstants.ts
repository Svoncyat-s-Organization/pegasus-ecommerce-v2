/**
 * Constantes para el módulo de Customer
 */

export const CUSTOMER_STATUS = {
  active: { label: 'Activo', color: 'success' },
  inactive: { label: 'Inactivo', color: 'default' },
} as const;

export const DOCUMENT_TYPES = [
  { value: 'DNI', label: 'DNI (8 dígitos)' },
  { value: 'CE', label: 'Carné de Extranjería (9-12 caracteres)' },
] as const;

export const ADDRESS_VALIDATION_RULES = {
  ubigeoPattern: /^[0-9]{6}$/,
  ubigeoMessage: 'El ubigeo debe ser 6 dígitos',
  maxAddressLength: 255,
  maxPostalCodeLength: 20,
} as const;

export const CUSTOMER_VALIDATION_RULES = {
  usernameMin: 3,
  usernameMax: 50,
  passwordMin: 6,
  firstNameMax: 100,
  lastNameMax: 100,
  phonePattern: /^[0-9]{9}$/,
  phoneMessage: 'El teléfono debe ser 9 dígitos (sin +51)',
  dniPattern: /^[0-9]{8}$/,
  dniMessage: 'El DNI debe ser 8 dígitos',
  cePattern: /^[A-Za-z0-9]{9,12}$/,
  ceMessage: 'El CE debe tener entre 9 y 12 caracteres alfanuméricos',
} as const;
