-- Add missing BaseEntity column for RMAs
-- Fixes: "ERROR: no existe la columna «is_active» en la relación «rmas»"

ALTER TABLE public.rmas
    ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

UPDATE public.rmas
SET is_active = true
WHERE is_active IS NULL;
