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
  username: string;
  expiresIn: number;
}

export interface User {
  userId: number;
  email: string;
  username: string;
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

// ============================================
// Customer Management Types (Storefront Customers)
// ============================================
export interface CustomerResponse {
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

export interface CreateCustomerRequest {
  username: string;
  email: string;
  password: string;
  docType: DocumentType;
  docNumber: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UpdateCustomerRequest {
  username?: string;
  email?: string;
  docType?: DocumentType;
  docNumber?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface CustomerAddressResponse {
  id: number;
  customerId: number;
  ubigeoId: string;
  address: string;
  reference?: string;
  postalCode?: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerAddressRequest {
  ubigeoId: string;
  address: string;
  reference?: string;
  postalCode?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export interface UpdateCustomerAddressRequest {
  ubigeoId?: string;
  address?: string;
  reference?: string;
  postalCode?: string;
}

// ============================================
// Catalog Types (Products, Brands, Categories, Variants, Images)
// ============================================

// Brand
export interface BrandResponse extends BaseEntity {
  name: string;
  slug: string;
  imageUrl: string;
}

export interface CreateBrandRequest {
  name: string;
  slug: string;
  imageUrl: string;
}

export interface UpdateBrandRequest {
  name?: string;
  slug?: string;
  imageUrl?: string;
}

// Category
export interface CategoryResponse extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: number;
}

// Product
export interface ProductResponse extends BaseEntity {
  code: string;
  name: string;
  slug: string;
  description?: string;
  brandId?: number;
  brandName?: string;
  categoryId: number;
  categoryName?: string;
  specs: Record<string, unknown>;
  isFeatured: boolean;
}

export interface CreateProductRequest {
  code: string;
  name: string;
  slug: string;
  description?: string;
  brandId?: number;
  categoryId: number;
  specs?: Record<string, unknown>;
  isFeatured?: boolean;
}

export interface UpdateProductRequest {
  code?: string;
  name?: string;
  slug?: string;
  description?: string;
  brandId?: number;
  categoryId?: number;
  specs?: Record<string, unknown>;
  isFeatured?: boolean;
}

// Variant
export interface VariantResponse extends BaseEntity {
  productId: number;
  sku: string;
  price: number;
  attributes: Record<string, unknown>;
}

export interface CreateVariantRequest {
  productId: number;
  sku: string;
  price: number;
  attributes?: Record<string, unknown>;
}

export interface UpdateVariantRequest {
  sku?: string;
  price?: number;
  attributes?: Record<string, unknown>;
}

// Image
export interface ImageResponse {
  id: number;
  imageUrl: string;
  productId: number;
  variantId?: number;
  isPrimary: boolean;
  displayOrder: number;
}

export interface CreateImageRequest {
  imageUrl: string;
  productId: number;
  variantId?: number;
  isPrimary?: boolean;
  displayOrder?: number;
}

export interface UpdateImageRequest {
  imageUrl?: string;
  isPrimary?: boolean;
  displayOrder?: number;
}
