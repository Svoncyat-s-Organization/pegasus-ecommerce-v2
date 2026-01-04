export const RBAC_TABS = {
  ROLES: 'roles',
  MODULES: 'modules',
} as const;

export const ROLE_FORM_RULES = {
  name: [
    { required: true, message: 'El nombre del rol es requerido' },
    { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
    { max: 50, message: 'El nombre no puede exceder 50 caracteres' },
  ],
  description: [
    { max: 255, message: 'La descripción no puede exceder 255 caracteres' },
  ],
};

export const MODULE_FORM_RULES = {
  name: [
    { required: true, message: 'El nombre del módulo es requerido' },
    { max: 50, message: 'El nombre no puede exceder 50 caracteres' },
  ],
  path: [
    { required: true, message: 'La ruta es requerida' },
    { max: 100, message: 'La ruta no puede exceder 100 caracteres' },
    {
      pattern: /^\/[a-z0-9\-/]*$/,
      message: 'La ruta debe comenzar con / y solo contener letras minúsculas, números y guiones',
    },
  ],
  icon: [
    { max: 50, message: 'El ícono no puede exceder 50 caracteres' },
  ],
};
