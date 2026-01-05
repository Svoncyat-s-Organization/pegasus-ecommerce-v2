import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartState, CartItem } from '../types/cart.types';

/**
 * Cart Store - Gestión de estado del carrito con persistencia
 * Almacena items, calcula totales y persiste en localStorage
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          // Verificar si el item ya existe (mismo variantId)
          const existingItemIndex = state.items.findIndex(
            (item) => item.variantId === newItem.variantId
          );

          if (existingItemIndex !== -1) {
            // Si existe, incrementar cantidad
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += newItem.quantity;
            return { items: updatedItems };
          }

          // Si no existe, agregar nuevo item con ID único
          const itemWithId: CartItem = {
            ...newItem,
            id: `${newItem.variantId}-${Date.now()}`,
          };
          return { items: [...state.items, itemWithId] };
        });
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            // Si la cantidad es 0 o negativa, remover el item
            return { items: state.items.filter((item) => item.id !== itemId) };
          }

          // Actualizar cantidad
          const updatedItems = state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );
          return { items: updatedItems };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getIGV: () => {
        const { getSubtotal } = get();
        return getSubtotal() * 0.18; // 18% IGV en Perú
      },

      getTotal: () => {
        const { getSubtotal, getIGV } = get();
        return getSubtotal() + getIGV();
      },
    }),
    {
      name: 'cart-storage', // localStorage key
    }
  )
);
