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
// Inventory Module Types
// ============================================
export interface WarehouseResponse {
  id: number;
  code: string;
  name: string;
  ubigeoId: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Purchase Module Types
// ============================================
export type SupplierDocumentType = 'DNI' | 'RUC';

export interface SupplierResponse {
  id: number;
  docType: SupplierDocumentType;
  docNumber: string;
  companyName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  ubigeoId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierRequest {
  docType: SupplierDocumentType;
  docNumber: string;
  companyName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  ubigeoId?: string;
}

export interface UpdateSupplierRequest {
  docType: SupplierDocumentType;
  docNumber: string;
  companyName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  ubigeoId?: string;
}

export type PurchaseStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseItemResponse {
  id: number;
  variantId: number;
  quantity: number;
  unitCost: number;
  subtotal: number;
  createdAt: string;
}

export interface CreatePurchaseItemRequest {
  variantId: number;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseRequest {
  supplierId: number;
  warehouseId: number;
  userId: number;
  invoiceType: string;
  invoiceNumber: string;
  purchaseDate?: string;
  notes?: string;
  items: CreatePurchaseItemRequest[];
}

export interface UpdatePurchaseStatusRequest {
  status: PurchaseStatus;
}

export interface PurchaseResponse {
  id: number;
  supplier: SupplierResponse;
  warehouseId: number;
  userId: number;
  status: PurchaseStatus;
  invoiceType: string;
  invoiceNumber: string;
  totalAmount: number;
  purchaseDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseItemResponse[];
}

// ============================================
// Billing Module Types (Invoices & Payments)
// ============================================
export type InvoiceType = 'BILL' | 'INVOICE';

export type InvoiceStatus = 'ISSUED' | 'CANCELLED' | 'REJECTED';

export type DocumentSeriesType = 'BILL' | 'INVOICE' | 'CREDIT_NOTE';

export interface DocumentSeriesResponse {
  id: number;
  documentType: DocumentSeriesType;
  series: string;
  currentNumber: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentSeriesRequest {
  documentType: DocumentSeriesType;
  series: string;
  currentNumber?: number;
}

export interface UpdateDocumentSeriesRequest {
  series: string;
  currentNumber?: number;
}

// ============================================
// Orders Module Types (Backoffice select)
// ============================================
export type OrderStatus =
  | 'PENDING'
  | 'AWAIT_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderSummaryResponse {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerDocType?: DocumentType;
  customerDocNumber?: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSummaryResponse {
  id: number;
  orderId: number;
  seriesId?: number | null;
  invoiceType: InvoiceType;
  series: string;
  number: string;
  totalAmount: number;
  status: InvoiceStatus;
  issuedAt?: string;
}

export interface InvoiceResponse {
  id: number;
  orderId: number;
  seriesId?: number | null;
  invoiceType: InvoiceType;
  series: string;
  number: string;
  receiverTaxId: string;
  receiverName: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  issuedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceRequest {
  orderId: number;
  invoiceType: InvoiceType;
  series?: string;
  number?: string;
  receiverTaxId: string;
  receiverName: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  issuedAt?: string;
  seriesId?: number;
}

export interface UpdateInvoiceStatusRequest {
  status: InvoiceStatus;
}

export interface PaymentMethodResponse {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodRequest {
  name: string;
}

export interface UpdatePaymentMethodRequest {
  name: string;
}

export interface PaymentResponse {
  id: number;
  orderId: number;
  paymentMethodId: number;
  paymentMethodName?: string;
  amount: number;
  transactionId?: string;
  paymentDate?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  orderId: number;
  paymentMethodId: number;
  amount: number;
  transactionId?: string;
  paymentDate?: string;
  notes?: string;
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

// ============================================
// Logistic Module Types
// ============================================
export interface ShippingMethod {
  id: number;
  name: string;
  description: string;
  carrier: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  baseCost: number;
  costPerKg: number;
  isActive: boolean;
}

export interface CreateShippingMethodRequest {
  name: string;
  description: string;
  carrier: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  baseCost: number;
  costPerKg: number;
}

export interface UpdateShippingMethodRequest {
  name?: string;
  description?: string;
  carrier?: string;
  estimatedDaysMin?: number;
  estimatedDaysMax?: number;
  baseCost?: number;
  costPerKg?: number;
}

export interface Shipment {
  id: number;
  shipmentType: string;
  orderId: number;
  rmaId?: number;
  shippingMethodId: number;
  shippingMethodName: string;
  trackingNumber: string;
  shippingCost: number;
  weightKg: number;
  status: string;
  estimatedDeliveryDate: string;
  shippingAddress: Record<string, unknown>;
  recipientName: string;
  recipientPhone: string;
  requireSignature: boolean;
  packageQuantity: number;
  notes?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShipmentRequest {
  shipmentType: string;
  orderId: number;
  rmaId?: number;
  shippingMethodId: number;
  trackingNumber: string;
  shippingCost: number;
  weightKg: number;
  estimatedDeliveryDate: string;
  shippingAddress: Record<string, unknown>;
  recipientName: string;
  recipientPhone: string;
  requireSignature?: boolean;
  packageQuantity?: number;
  notes?: string;
}

export interface UpdateShipmentRequest {
  status?: string;
  notes?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface TrackingEvent {
  id: number;
  shipmentId: number;
  status: string;
  location?: string;
  description: string;
  isPublic: boolean;
  eventDate: string;
  createdById: number;
  createdByUsername: string;
  createdAt: string;
}

export interface CreateTrackingEventRequest {
  shipmentId: number;
  status: string;
  location?: string;
  description: string;
  isPublic?: boolean;
  eventDate?: string;
}
