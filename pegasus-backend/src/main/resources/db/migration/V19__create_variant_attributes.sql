-- ============================================
-- Migration: Create variant_attributes table (global catalog)
-- Purpose: Define a global catalog of variant attributes (color, size, storage, etc.)
-- These can be assigned to products via product_variant_attributes junction table
-- ============================================

CREATE TABLE public.variant_attributes (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    name varchar(50) NOT NULL,
    display_name varchar(100) NOT NULL,
    attribute_type varchar(20) NOT NULL DEFAULT 'TEXT',
    options jsonb NOT NULL DEFAULT '[]',
    description varchar(255),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT variant_attributes_pk PRIMARY KEY (id),
    CONSTRAINT variant_attributes_name_uq UNIQUE (name),
    CONSTRAINT variant_attributes_type_check CHECK (
        attribute_type IN ('TEXT', 'COLOR', 'SIZE', 'NUMBER')
    )
);

CREATE INDEX idx_variant_attributes_options ON public.variant_attributes USING gin (options);

COMMENT ON TABLE public.variant_attributes IS 'Global catalog of variant attributes. Reusable across all products.';
COMMENT ON COLUMN public.variant_attributes.name IS 'Internal name (lowercase, no spaces): color, size, storage, ram';
COMMENT ON COLUMN public.variant_attributes.display_name IS 'User-facing label: Color, Talla, Almacenamiento, RAM';
COMMENT ON COLUMN public.variant_attributes.attribute_type IS 'Type hint for UI: TEXT (plain text), COLOR (color picker/swatches), SIZE (size chart), NUMBER (numeric values)';
COMMENT ON COLUMN public.variant_attributes.options IS 'JSON array of possible values: ["Negro", "Blanco"] or ["S", "M", "L", "XL"] or ["64GB", "128GB", "256GB"]';
COMMENT ON COLUMN public.variant_attributes.description IS 'Optional description for admin reference';
