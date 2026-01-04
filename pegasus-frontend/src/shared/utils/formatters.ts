/**
 * Format currency in Peruvian Soles (PEN)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount);
};

/**
 * Format date to Spanish locale
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format datetime to Spanish locale
 */
export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format DNI (8 digits)
 */
export const formatDNI = (dni: string): string => {
  return dni.replace(/\D/g, '').slice(0, 8);
};

/**
 * Format CE (Carné de Extranjería)
 */
export const formatCE = (ce: string): string => {
  return ce.replace(/\D/g, '').slice(0, 20);
};

/**
 * Validate DNI (8 digits)
 */
export const validateDNI = (dni: string): boolean => {
  return /^\d{8}$/.test(dni);
};

/**
 * Validate email
 */
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
