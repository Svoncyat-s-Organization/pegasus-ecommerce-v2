import { useState, useEffect } from 'react';

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
 * Format CE (Carnet de Extranjeria) - 9-12 alphanumeric characters
 */
export const formatCE = (ce: string): string => {
  return ce.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
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
 * Format phone to Peru display format (+51 999 999 999)
 * Input: 9 digits stored plain (e.g., '987654321')
 * Output: '+51 987 654 321'
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 9) return phone;
  return `+51 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
};

/**
 * Clean phone number (remove formatting, keep only digits)
 */
export const cleanPhone = (phone: string): string => {
  return phone.replace(/\D/g, '').slice(0, 9);
};

/**
 * Validate Peru phone (9 digits starting with 9)
 */
export const validatePhone = (phone: string): boolean => {
  const cleaned = cleanPhone(phone);
  return /^9\d{8}$/.test(cleaned);
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

/**
 * Custom hook for debounced value
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
