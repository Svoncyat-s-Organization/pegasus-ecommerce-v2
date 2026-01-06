// ============================================
// Authentication Types
// ============================================
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterCustomerRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  docType: 'DNI' | 'CE';
  docNumber: string;
  phone?: string;
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
  variantSku?: string;
  productName?: string;
  quantity: number;
  receivedQuantity?: number;
  unitCost: number;
  subtotal: number;
  createdAt: string;
}

export interface ReceiveItemRequest {
  itemId: number;
  quantity: number;
}

export interface ReceiveItemsRequest {
  items: ReceiveItemRequest[];
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
export type InvoiceType = 'BILL' | 'INVOICE' | 'CREDIT_NOTE';

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
// Location Types (Ubigeo - Peru)
// ============================================
export interface Department {
  id: string;
  name: string;
}

export interface Province {
  id: string;
  name: string;
  departmentId: string;
}

export interface District {
  id: string;
  name: string;
  provinceId: string;
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
// Logistics Types (Shipping Methods)
// ============================================
export interface ShippingMethodResponse {
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

// ============================================
// Order Module Types
// ============================================
export interface AddressDTO {
  ubigeoId: string;
  address: string;
  reference?: string;
  recipientName: string;
  recipientPhone: string;
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  variantId: number;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderStatusHistoryResponse {
  id: number;
  status: OrderStatus;
  notes?: string;
  changedAt: string;
  changedByUserId: number;
  changedByUsername: string;
}

export interface OrderSummaryResponse {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  total: number;
  shippingAddress: Record<string, any>;
  billingAddress: Record<string, any>;
  items: OrderItemResponse[];
  statusHistories: OrderStatusHistoryResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemRequest {
  variantId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerId: number;
  items: OrderItemRequest[];
  shippingAddress: AddressDTO;
  billingAddress?: AddressDTO;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

// ============================================
// RMA Module Types (Return Merchandise Authorization)
// ============================================
export type RmaStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'IN_TRANSIT' 
  | 'RECEIVED' 
  | 'INSPECTING' 
  | 'REFUNDED' 
  | 'CLOSED' 
  | 'CANCELLED';

export type RmaReason = 
  | 'DEFECTIVE' 
  | 'WRONG_ITEM' 
  | 'NOT_AS_DESCRIBED' 
  | 'DAMAGED_SHIPPING' 
  | 'CHANGED_MIND' 
  | 'SIZE_COLOR' 
  | 'LATE_DELIVERY' 
  | 'OTHER';

export type ItemCondition = 
  | 'UNOPENED' 
  | 'OPENED_UNUSED' 
  | 'USED_LIKE_NEW' 
  | 'USED_GOOD' 
  | 'DAMAGED' 
  | 'DEFECTIVE';

export type RefundMethod = 
  | 'ORIGINAL_PAYMENT' 
  | 'BANK_TRANSFER' 
  | 'STORE_CREDIT' 
  | 'EXCHANGE';

export interface RmaItemResponse {
  id: number;
  rmaId: number;
  orderItemId: number;
  variantId: number;
  variantSku: string;
  productName: string;
  quantity: number;
  itemCondition?: ItemCondition;
  inspectionNotes?: string;
  refundAmount: number;
  restockApproved?: boolean;
  inspectedBy?: number;
  inspectorName?: string;
  inspectedAt?: string;
  createdAt: string;
}

export interface RmaStatusHistoryResponse {
  id: number;
  status: RmaStatus;
  comments?: string;
  changedAt: string;
  changedByUserId: number;
  changedByUsername: string;
}

export interface RmaSummaryResponse {
  id: number;
  rmaNumber: string;
  orderId: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  status: RmaStatus;
  reason: RmaReason;
  refundMethod?: RefundMethod;
  refundAmount: number;
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RmaResponse {
  id: number;
  rmaNumber: string;
  orderId: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  status: RmaStatus;
  reason: RmaReason;
  customerComments?: string;
  staffNotes?: string;
  refundMethod?: RefundMethod;
  refundAmount: number;
  restockingFee: number;
  shippingCostRefund: number;
  approvedBy?: number;
  approverName?: string;
  approvedAt?: string;
  receivedAt?: string;
  refundedAt?: string;
  closedAt?: string;
  items: RmaItemResponse[];
  statusHistories: RmaStatusHistoryResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface RmaItemRequest {
  orderItemId: number;
  variantId: number;
  quantity: number;
}

export interface CreateRmaRequest {
  orderId: number;
  reason: RmaReason;
  customerComments?: string;
  items: RmaItemRequest[];
}

export interface UpdateRmaRequest {
  status?: RmaStatus;
  staffNotes?: string;
  refundMethod?: RefundMethod;
}

export interface ApproveRmaRequest {
  approved: boolean;
  comments?: string;
}

export interface InspectItemRequest {
  rmaItemId: number;
  itemCondition: ItemCondition;
  inspectionNotes?: string;
  restockApproved: boolean;
}

// ============================================
// Inventory Module Types
// ============================================

export type OperationType =
  | 'INVENTORY_ADJUSTMENT'
  | 'PURCHASE'
  | 'SALE'
  | 'RETURN'
  | 'CANCELLATION'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

// Warehouse
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

export interface CreateWarehouseRequest {
  code: string;
  name: string;
  ubigeoId: string;
  address: string;
}

export interface UpdateWarehouseRequest {
  code?: string;
  name?: string;
  ubigeoId?: string;
  address?: string;
}

// Stock
export interface StockResponse {
  id: number;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  variantId: number;
  variantSku: string;
  productName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  updatedAt: string;
}

export interface StockSummaryResponse {
  warehouseId: number;
  warehouseCode: string;
  variantId: number;
  variantSku: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface StockAvailabilityResponse {
  available: boolean;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  requestedQuantity: number;
}

export interface AdjustStockRequest {
  variantId: number;
  warehouseId: number;
  quantityChange: number; // Puede ser negativo
  reason: string;
}

export interface TransferStockRequest {
  variantId: number;
  fromWarehouseId: number;
  toWarehouseId: number;
  quantity: number;
  reason?: string;
}

// Movement (Kardex)
export interface MovementResponse {
  id: number;
  variantId: number;
  variantSku: string;
  productName: string;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  balance: number;
  unitCost: number;
  operationType: OperationType;
  description: string;
  referenceId: number | null;
  referenceTable: string | null;
  userId: number;
  username: string;
  createdAt: string;
}

// ============================================
// Dashboard Module Types
// ============================================
export interface ChartPointResponse {
  label: string;
  value: number;
  count: number;
}

export interface SalesMetricsResponse {
  totalSales: number;
  totalOrders: number;
  averageTicket: number;
  salesGrowthPercent: number;
  ordersGrowthPercent: number;
  periodLabel: string;
}

export interface CustomerMetricsResponse {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  newCustomersLastMonth: number;
  customerGrowthPercent: number;
}

export interface LowStockProductResponse {
  variantId: number;
  productName: string;
  variantSku: string;
  warehouseName: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
}

export interface InventoryMetricsResponse {
  totalProducts: number;
  activeProducts: number;
  totalVariants: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValue: number;
  lowStockProducts: LowStockProductResponse[];
}

export interface PurchaseMetricsResponse {
  totalPurchases: number;
  totalPurchasesAmount: number;
  pendingPurchases: number;
  periodLabel: string;
}

export interface RmaMetricsResponse {
  pendingRmas: number;
  processingRmas: number;
  completedRmas: number;
  rmaRate: number;
  periodLabel: string;
}

export interface OrdersByStatusResponse {
  status: string;
  count: number;
  label: string;
}

export interface TopProductResponse {
  productId: number;
  productName: string;
  productCode: string;
  variantSku: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface RecentOrderResponse {
  id: number;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  statusLabel: string;
  createdAt: string;
}

export interface SalesChartDataResponse {
  dailySales: ChartPointResponse[];
  monthlySales: ChartPointResponse[];
}

export interface DashboardSummaryResponse {
  sales: SalesMetricsResponse;
  customers: CustomerMetricsResponse;
  inventory: InventoryMetricsResponse;
  purchases: PurchaseMetricsResponse;
  rma: RmaMetricsResponse;
  ordersByStatus: OrdersByStatusResponse[];
  topProducts: TopProductResponse[];
  recentOrders: RecentOrderResponse[];
  charts: SalesChartDataResponse;
}

// ============================================
// Report Module Types
// ============================================

// Sales Report
export interface SalesReportRow {
  date: string;
  orders: number;
  sales: number;
}

export interface SalesReportResponse {
  startDate: string;
  endDate: string;
  totalOrders: number;
  totalSales: number;
  averageTicket: number;
  details: SalesReportRow[];
}

// Invoice Report
export interface InvoiceReportRow {
  id: number;
  type: InvoiceType;
  series: string;
  number: string;
  issuedAt: string;
  receiverTaxId: string;
  receiverName: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
}

export interface InvoiceReportResponse {
  startDate: string;
  endDate: string;
  totalInvoices: number;
  totalBills: number;
  totalTaxAmount: number;
  totalAmount: number;
  documents: InvoiceReportRow[];
}

// Purchase Report
export interface PurchaseReportRow {
  supplierId: number;
  supplierName: string;
  supplierDocNumber: string;
  purchaseCount: number;
  totalAmount: number;
}

export interface PurchaseReportResponse {
  startDate: string;
  endDate: string;
  totalPurchases: number;
  totalAmount: number;
  bySupplier: PurchaseReportRow[];
}

// Inventory Report
export interface InventoryWarehouseRow {
  warehouseId: number;
  warehouseName: string;
  variantCount: number;
  units: number;
  value: number;
}

export interface InventoryReportResponse {
  reportDate: string;
  totalVariants: number;
  totalUnits: number;
  totalValue: number;
  byWarehouse: InventoryWarehouseRow[];
}

// Payment Report
export interface PaymentMethodRow {
  paymentMethodId: number;
  paymentMethodName: string;
  count: number;
  amount: number;
}

export interface PaymentReportResponse {
  startDate: string;
  endDate: string;
  totalPayments: number;
  totalAmount: number;
  byPaymentMethod: PaymentMethodRow[];
}

// ============================================
// Settings Module Types
// ============================================

// Business Info
export interface BusinessInfoResponse {
  id: number;
  businessName: string;
  ruc: string;
  legalAddress: string;
  ubigeoId: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  businessDescription?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  isActive: boolean;
  updatedAt: string;
}

export interface UpdateBusinessInfoRequest {
  businessName: string;
  ruc: string;
  legalAddress: string;
  ubigeoId: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  businessDescription?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
}

// Storefront Settings
export interface StorefrontSettingsResponse {
  id: number;
  storefrontName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  termsAndConditions?: string;
  privacyPolicy?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
  supportEmail?: string;
  supportPhone?: string;
  whatsappNumber?: string;
  isActive: boolean;
  updatedAt: string;
}

export interface UpdateStorefrontSettingsRequest {
  storefrontName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  termsAndConditions?: string;
  privacyPolicy?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
  supportEmail?: string;
  supportPhone?: string;
  whatsappNumber?: string;
}
