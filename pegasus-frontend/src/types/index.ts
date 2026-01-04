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

// ============================================
// RBAC Types (Roles, Modules, Permissions, Assignments)
// ============================================
export interface RoleResponse {
  id: number;
  name: string;
  description?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
}

export interface ModuleResponse {
  id: number;
  icon?: string;
  name: string;
  path: string;
}

export interface CreateModuleRequest {
  icon?: string;
  name: string;
  path: string;
}

export interface UpdateModuleRequest {
  icon?: string;
  name: string;
  path: string;
}

export interface RoleWithModulesResponse {
  roleId: number;
  roleName: string;
  roleDescription?: string;
  modules: ModuleResponse[];
}

export interface UserWithRolesResponse {
  userId: number;
  username: string;
  email: string;
  roles: RoleResponse[];
}

export interface AssignModulesToRoleRequest {
  roleId: number;
  moduleIds: number[];
}

export interface AssignRolesToUserRequest {
  userId: number;
  roleIds: number[];
}
