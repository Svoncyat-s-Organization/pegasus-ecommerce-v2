-- ============================================
-- Migración: Reemplazar ENUMs de PostgreSQL por VARCHAR con CHECK constraints
-- Archivo: V5__replace_enums_with_varchar.sql
-- Descripción: Mejora la compatibilidad con JPA/Hibernate eliminando tipos ENUM nativos
-- ============================================

-- ============================================
-- 1. DOCUMENT_TYPE_ENUM (users.doc_type, customers.doc_type)
-- ============================================

-- Cambiar columna en users (solo si es tipo enum)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'doc_type' 
        AND udt_name = 'document_type_enum'
    ) THEN
        ALTER TABLE public.users ALTER COLUMN doc_type TYPE VARCHAR(10) USING doc_type::TEXT;
    END IF;
END $$;

-- Agregar CHECK constraint en users (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_doc_type_check'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_doc_type_check CHECK (doc_type IN ('DNI', 'CE'));
    END IF;
END $$;

-- Cambiar columna en customers (solo si es tipo enum)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'doc_type' 
        AND udt_name = 'document_type_enum'
    ) THEN
        ALTER TABLE public.customers ALTER COLUMN doc_type TYPE VARCHAR(10) USING doc_type::TEXT;
    END IF;
END $$;

-- Agregar CHECK constraint en customers (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'customers_doc_type_check'
    ) THEN
        ALTER TABLE public.customers ADD CONSTRAINT customers_doc_type_check CHECK (doc_type IN ('DNI', 'CE'));
    END IF;
END $$;

-- ============================================
-- 2. OPERATION_TYPE_ENUM (movements.operation_type)
-- ============================================

-- Cambiar columna en movements (solo si es tipo enum)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'movements' AND column_name = 'operation_type' 
        AND udt_name = 'operation_type_enum'
    ) THEN
        ALTER TABLE public.movements ALTER COLUMN operation_type TYPE VARCHAR(30) USING operation_type::TEXT;
    END IF;
END $$;

-- Agregar CHECK constraint (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'movements_operation_type_check'
    ) THEN
        ALTER TABLE public.movements ADD CONSTRAINT movements_operation_type_check 
        CHECK (operation_type IN (
            'INVENTORY_ADJUSTMENT', 'PURCHASE', 'SALE', 'RETURN', 
            'CANCELLATION', 'TRANSFER_IN', 'TRANSFER_OUT'
        ));
    END IF;
END $$;

-- ============================================
-- 3. ORDER_STATUS_ENUM (orders.status, order_status_histories.status)
-- ============================================

-- Cambiar columna en orders (solo si es tipo enum)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'status' 
        AND udt_name = 'order_status_enum'
    ) THEN
        ALTER TABLE public.orders ALTER COLUMN status TYPE VARCHAR(20) USING status::TEXT;
    END IF;
END $$;

-- Agregar CHECK constraint en orders (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_check'
    ) THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
        CHECK (status IN (
            'PENDING', 'AWAIT_PAYMENT', 'PAID', 'PROCESSING', 
            'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
        ));
    END IF;
END $$;

-- Cambiar columna en order_status_histories (solo si es tipo enum)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_status_histories' AND column_name = 'status' 
        AND udt_name = 'order_status_enum'
    ) THEN
        ALTER TABLE public.order_status_histories ALTER COLUMN status TYPE VARCHAR(20) USING status::TEXT;
    END IF;
END $$;

-- Agregar CHECK constraint en order_status_histories (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'order_status_histories_status_check'
    ) THEN
        ALTER TABLE public.order_status_histories ADD CONSTRAINT order_status_histories_status_check 
        CHECK (status IN (
            'PENDING', 'AWAIT_PAYMENT', 'PAID', 'PROCESSING', 
            'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
        ));
    END IF;
END $$;

-- ============================================
-- 4. PURCHASE_STATUS_ENUM (purchases.status)
-- ============================================

-- Cambiar columna en purchases (solo si es tipo enum)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchases' AND column_name = 'status' 
        AND udt_name = 'purchase_status_enum'
    ) THEN
        ALTER TABLE public.purchases ALTER COLUMN status TYPE VARCHAR(20) USING status::TEXT;
    END IF;
END $$;

-- Agregar CHECK constraint (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'purchases_status_check'
    ) THEN
        ALTER TABLE public.purchases ADD CONSTRAINT purchases_status_check 
        CHECK (status IN ('PENDING', 'RECEIVED', 'CANCELLED'));
    END IF;
END $$;

-- ============================================
-- 5. ELIMINAR TIPOS ENUM (ya no son necesarios)
-- ============================================

DROP TYPE IF EXISTS public.document_type_enum CASCADE;
DROP TYPE IF EXISTS public.operation_type_enum CASCADE;
DROP TYPE IF EXISTS public.order_status_enum CASCADE;
DROP TYPE IF EXISTS public.purchase_status_enum CASCADE;

-- ============================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ============================================
COMMENT ON COLUMN public.users.doc_type IS 'Tipo de documento: DNI, CE';
COMMENT ON COLUMN public.customers.doc_type IS 'Tipo de documento: DNI, CE';
COMMENT ON COLUMN public.movements.operation_type IS 'Tipo de operación de inventario';
COMMENT ON COLUMN public.orders.status IS 'Estado del pedido';
COMMENT ON COLUMN public.order_status_histories.status IS 'Estado registrado en el historial';
COMMENT ON COLUMN public.purchases.status IS 'Estado de la orden de compra';
