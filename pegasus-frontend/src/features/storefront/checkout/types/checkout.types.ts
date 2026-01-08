/**
 * Checkout Module - Type Definitions
 */

/**
 * Dirección para envío/facturación (coincide con AddressDTO del backend)
 */
export interface AddressDTO {
  /** ID del ubigeo (6 dígitos) */
  ubigeoId: string;

  /** Dirección completa */
  address: string;

  /** Referencia adicional */
  reference?: string;

  /** Nombre del destinatario */
  recipientName: string;

  /** Teléfono del destinatario (9 dígitos) */
  recipientPhone: string;
}

/**
 * Dirección de envío extendida para el formulario (incluye display names)
 */
export interface ShippingAddress extends AddressDTO {
  /** Nombres de ubicación para display (no se envían al backend) */
  departmentName?: string;
  provinceName?: string;
  districtName?: string;
}

export interface CheckoutFormValues {
  /** Dirección de envío */
  shippingAddress: ShippingAddress;

  /** ID del método de envío seleccionado */
  shippingMethodId: number | null;

  /** Notas adicionales del pedido */
  notes?: string;
}

export interface CreateOrderRequest {
  /** ID del cliente */
  customerId: number;

  /** Items del pedido */
  items: OrderItemRequest[];

  /** Dirección de envío */
  shippingAddress: AddressDTO;

  /** Dirección de facturación (opcional, usa shipping si no se proporciona) */
  billingAddress?: AddressDTO;

  /** ID del método de envío */
  shippingMethodId?: number;

  /** Método de pago seleccionado */
  paymentMethod?: string;

  /** ID de transacción (si aplica) */
  paymentTransactionId?: string;

  /** Tipo de comprobante preferido (BILL o INVOICE) */
  preferredInvoiceType?: 'BILL' | 'INVOICE';
}

export interface OrderItemRequest {
  /** ID de la variante */
  variantId: number;

  /** Cantidad */
  quantity: number;

  /** Precio unitario en el momento de la compra */
  unitPrice: number;
}

export interface CreateOrderResponse {
  /** ID del pedido creado */
  id: number;

  /** Número de orden */
  orderNumber: string;

  /** Total del pedido */
  total: number;

  /** Fecha de creación */
  createdAt: string;
}
