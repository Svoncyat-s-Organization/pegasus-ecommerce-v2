-- ============================================
-- Migración: Reemplazar rma_status_enum por VARCHAR con CHECK constraint
-- Archivo: V6__replace_rma_enum_with_varchar.sql
-- ============================================

-- Cambiar columna en rmas (solo si es tipo enum)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rmas' AND column_name = 'status' 
        AND udt_name = 'rma_status_enum'
    ) THEN
        ALTER TABLE public.rmas ALTER COLUMN status TYPE VARCHAR(20) USING status::TEXT;
    END IF;
END $$;

-- Agregar CHECK constraint en rmas (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'rmas_status_check'
    ) THEN
        ALTER TABLE public.rmas ADD CONSTRAINT rmas_status_check 
        CHECK (status IN (
            'PENDING', 'APPROVED', 'REJECTED', 
            'RECEIVED', 'PROCESSING', 'COMPLETED', 'CANCELLED'
        ));
    END IF;
END $$;

-- Cambiar columna en rma_status_histories (solo si es tipo enum)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rma_status_histories' AND column_name = 'status' 
        AND udt_name = 'rma_status_enum'
    ) THEN
        ALTER TABLE public.rma_status_histories ALTER COLUMN status TYPE VARCHAR(20) USING status::TEXT;
    END IF;
END $$;

-- Agregar CHECK constraint en rma_status_histories (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'rma_status_histories_status_check'
    ) THEN
        ALTER TABLE public.rma_status_histories ADD CONSTRAINT rma_status_histories_status_check 
        CHECK (status IN (
            'PENDING', 'APPROVED', 'REJECTED', 
            'RECEIVED', 'PROCESSING', 'COMPLETED', 'CANCELLED'
        ));
    END IF;
END $$;

-- Eliminar tipo ENUM de RMA
DROP TYPE IF EXISTS public.rma_status_enum CASCADE;

COMMENT ON COLUMN public.rmas.status IS 'Estado de la solicitud RMA';
COMMENT ON COLUMN public.rma_status_histories.status IS 'Estado registrado en historial RMA';
