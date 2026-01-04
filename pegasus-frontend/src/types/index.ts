// ============================================
// Authentication Types
// ============================================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userType: 'ADMIN' | 'CUSTOMER';
  userId: number;
  email: string;
  expiresIn: number;
}

export interface User {
  userId: number;
  email: string;
  userType: 'ADMIN' | 'CUSTOMER';
}

// ============================================
// API Response Types
// ============================================
export interface ApiError {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ============================================
// Common Domain Types
// ============================================
export type DocumentType = 'DNI' | 'CE';

export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// ============================================
// Navigation Types
// ============================================
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

export interface BreadcrumbItem {
  title: string;
  path?: string;
}

// ============================================
// User Management Types (Backoffice Staff)
// ============================================
export interface UserDetail extends BaseEntity {
  username: string;
  email: string;
  docType: DocumentType;
  docNumber: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  docType: DocumentType;
  docNumber: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UpdateUserRequest {
  username: string;
  email: string;
  docType: DocumentType;
  docNumber: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  docType: DocumentType;
  docNumber: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
