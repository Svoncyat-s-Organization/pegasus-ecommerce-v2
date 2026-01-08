-- ============================================
-- Migration: Create product_attributes table
-- Purpose: Define attribute types and options for product variants
-- ============================================

CREATE TABLE public.product_attributes (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    product_id bigint NOT NULL,
    name varchar(50) NOT NULL,
    display_name varchar(100) NOT NULL,
    options jsonb NOT NULL DEFAULT '[]',
    position int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT product_attributes_pk PRIMARY KEY (id),
    CONSTRAINT product_attributes_product_name_uq UNIQUE (product_id, name),
    CONSTRAINT product_attributes_product_fk FOREIGN KEY (product_id)
        REFERENCES public.products (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_product_attributes_product ON public.product_attributes (product_id);
CREATE INDEX idx_product_attributes_options ON public.product_attributes USING gin (options);

COMMENT ON TABLE public.product_attributes IS 'Defines attribute types (color, size, etc.) and their options for product variants';
COMMENT ON COLUMN public.product_attributes.name IS 'Internal name (lowercase, no spaces): color, storage, size';
COMMENT ON COLUMN public.product_attributes.display_name IS 'User-facing label: Color, Almacenamiento, Talla';
COMMENT ON COLUMN public.product_attributes.options IS 'JSON array of possible values: ["Negro", "Blanco", "Azul"]';
COMMENT ON COLUMN public.product_attributes.position IS 'Display order in forms';
