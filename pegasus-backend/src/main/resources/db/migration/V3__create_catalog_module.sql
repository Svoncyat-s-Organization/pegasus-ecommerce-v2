-- ============================================
-- Module: CATALOG
-- Tables: brands, categories, products, variants, images
-- ============================================

CREATE TABLE public.brands (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    name varchar(50) NOT NULL,
    slug varchar(50) NOT NULL,
    image_url varchar(255),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT brands_pk PRIMARY KEY (id),
    CONSTRAINT brands_name_uq UNIQUE (name),
    CONSTRAINT brands_slug_uq UNIQUE (slug)
);

CREATE TABLE public.categories (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    slug text NOT NULL,
    description varchar(255),
    parent_id bigint,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT categories_pk PRIMARY KEY (id),
    CONSTRAINT categories_slug_uq UNIQUE (slug),
    CONSTRAINT categories_parent_fk FOREIGN KEY (parent_id)
        REFERENCES public.categories (id) MATCH SIMPLE
        ON DELETE SET NULL ON UPDATE NO ACTION
);

CREATE TABLE public.products (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    code varchar(50) NOT NULL,
    name varchar(255) NOT NULL,
    slug varchar(50) NOT NULL,
    description text,
    brand_id bigint,
    category_id bigint NOT NULL,
    specs jsonb NOT NULL DEFAULT '{}',
    is_featured boolean DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT products_pk PRIMARY KEY (id),
    CONSTRAINT products_code_uq UNIQUE (code),
    CONSTRAINT products_slug_uq UNIQUE (slug),
    CONSTRAINT products_brand_fk FOREIGN KEY (brand_id)
        REFERENCES public.brands (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT products_category_fk FOREIGN KEY (category_id)
        REFERENCES public.categories (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_products_spec ON public.products USING gin (specs);

CREATE TABLE public.variants (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    product_id bigint NOT NULL,
    sku varchar(50) NOT NULL,
    price numeric(12, 2) NOT NULL,
    attributes jsonb NOT NULL DEFAULT '{}',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT variants_pk PRIMARY KEY (id),
    CONSTRAINT variants_sku_uq UNIQUE (sku),
    CONSTRAINT variants_product_fk FOREIGN KEY (product_id)
        REFERENCES public.products (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_variants_attributes ON public.variants USING gin (attributes);

CREATE TABLE public.images (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    image_url varchar(255) NOT NULL,
    product_id bigint NOT NULL,
    variant_id bigint,
    is_primary boolean NOT NULL DEFAULT false,
    display_order integer NOT NULL DEFAULT 0,
    CONSTRAINT images_pk PRIMARY KEY (id),
    CONSTRAINT images_product_fk FOREIGN KEY (product_id)
        REFERENCES public.products (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT images_variant_fk FOREIGN KEY (variant_id)
        REFERENCES public.variants (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE
);
