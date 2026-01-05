-- ============================================
-- Migración: Agregar columna is_active a orders
-- Archivo: V4__add_is_active_to_orders.sql
-- Descripción: Agrega la columna is_active a la tabla orders para cumplir con BaseEntity
-- ============================================

-- Agregar columna is_active a orders (valor por defecto true, no nulo)
ALTER TABLE public.orders 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Comentario para documentación
COMMENT ON COLUMN public.orders.is_active IS 'Indica si el pedido está activo (soft delete)';
