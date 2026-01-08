-- ============================================
-- Migration: Create category_specifications table
-- Purpose: Define specifications at category level with inheritance support
-- Specifications are inherited from parent categories to children
-- ============================================

CREATE TABLE public.category_specifications (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    category_id bigint NOT NULL,
    name varchar(50) NOT NULL,
    display_name varchar(100) NOT NULL,
    spec_type varchar(20) NOT NULL DEFAULT 'TEXT',
    unit varchar(20),
    options jsonb,
    is_required boolean NOT NULL DEFAULT false,
    position int NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT category_specifications_pk PRIMARY KEY (id),
    CONSTRAINT category_specifications_category_name_uq UNIQUE (category_id, name),
    CONSTRAINT category_specifications_category_fk FOREIGN KEY (category_id)
        REFERENCES public.categories (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT category_specifications_type_check CHECK (
        spec_type IN ('TEXT', 'NUMBER', 'SELECT', 'BOOLEAN')
    )
);

CREATE INDEX idx_category_specifications_category ON public.category_specifications (category_id);
CREATE INDEX idx_category_specifications_options ON public.category_specifications USING gin (options);

COMMENT ON TABLE public.category_specifications IS 'Defines specification fields for products within a category. Specs are inherited from parent categories.';
COMMENT ON COLUMN public.category_specifications.name IS 'Internal name (lowercase, no spaces): weight, material, screen_size';
COMMENT ON COLUMN public.category_specifications.display_name IS 'User-facing label: Peso, Material, Tamaño de pantalla';
COMMENT ON COLUMN public.category_specifications.spec_type IS 'Data type: TEXT (free text), NUMBER (numeric with optional unit), SELECT (dropdown from options), BOOLEAN (yes/no)';
COMMENT ON COLUMN public.category_specifications.unit IS 'Unit of measurement for NUMBER type: kg, cm, mAh, GB';
COMMENT ON COLUMN public.category_specifications.options IS 'JSON array for SELECT type: ["Algodón", "Poliéster", "Lana"]';
COMMENT ON COLUMN public.category_specifications.is_required IS 'Whether this spec must be filled when creating products';
COMMENT ON COLUMN public.category_specifications.position IS 'Display order in forms';
