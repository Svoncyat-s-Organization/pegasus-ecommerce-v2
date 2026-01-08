-- ============================================
-- Migration: Refactor product_attributes to product_variant_attributes
-- Purpose: Replace per-product attribute definitions with references to global catalog
-- This is a junction table linking products to variant_attributes
-- ============================================

-- Step 1: Drop the old product_attributes table
-- Note: Any existing data will be lost - this is acceptable for MVP phase
DROP TABLE IF EXISTS public.product_attributes;

-- Step 2: Create the new junction table
CREATE TABLE public.product_variant_attributes (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    product_id bigint NOT NULL,
    variant_attribute_id bigint NOT NULL,
    custom_options jsonb,
    position int NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT product_variant_attributes_pk PRIMARY KEY (id),
    CONSTRAINT product_variant_attributes_product_attr_uq UNIQUE (product_id, variant_attribute_id),
    CONSTRAINT product_variant_attributes_product_fk FOREIGN KEY (product_id)
        REFERENCES public.products (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT product_variant_attributes_attr_fk FOREIGN KEY (variant_attribute_id)
        REFERENCES public.variant_attributes (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_product_variant_attributes_product ON public.product_variant_attributes (product_id);
CREATE INDEX idx_product_variant_attributes_attr ON public.product_variant_attributes (variant_attribute_id);
CREATE INDEX idx_product_variant_attributes_options ON public.product_variant_attributes USING gin (custom_options);

COMMENT ON TABLE public.product_variant_attributes IS 'Links products to global variant attributes. Allows optional custom options override.';
COMMENT ON COLUMN public.product_variant_attributes.custom_options IS 'Optional: Override global options with product-specific values. If NULL, use options from variant_attributes.';
COMMENT ON COLUMN public.product_variant_attributes.position IS 'Display order of this attribute within the product form';
