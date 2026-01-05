/**
 * Cart Module - Type Definitions
 * Interfaces y tipos para el carrito de compras
 */

export interface CartItem {
  /** ID único del item en el carrito */
  id: string;
  
  /** ID del producto (backend) */
  productId: number;
  
  /** ID de la variante seleccionada */
  variantId: number;
  
  /** SKU de la variante */
  sku: string;
  
  /** Nombre del producto */
  productName: string;
  
  /** Nombre de la marca */
  brandName: string | undefined;
  
  /** Precio unitario (de la variante) */
  price: number;
  
  /** Cantidad seleccionada */
  quantity: number;
  
  /** URL de la imagen principal */
  imageUrl?: string;
  
  /** Atributos de la variante (color, storage, etc.) */
  attributes: Record<string, string>;
}

export interface CartState {
  /** Lista de items en el carrito */
  items: CartItem[];
  
  /** Agregar item al carrito */
  addItem: (item: Omit<CartItem, 'id'>) => void;
  
  /** Actualizar cantidad de un item */
  updateQuantity: (itemId: string, quantity: number) => void;
  
  /** Remover item del carrito */
  removeItem: (itemId: string) => void;
  
  /** Limpiar todo el carrito */
  clearCart: () => void;
  
  /** Obtener cantidad total de items */
  getTotalItems: () => number;
  
  /** Obtener subtotal (sin IGV) */
  getSubtotal: () => number;
  
  /** Obtener IGV (18%) */
  getIGV: () => number;
  
  /** Obtener total (con IGV) */
  getTotal: () => number;
}
