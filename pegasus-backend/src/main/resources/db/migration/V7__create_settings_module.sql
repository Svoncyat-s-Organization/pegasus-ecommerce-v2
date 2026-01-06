-- ============================================
-- Module: SETTINGS
-- Tables: business_info, storefront_settings
-- Dependencies: ubigeos
-- ============================================

CREATE TABLE public.business_info (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    business_name varchar(255) NOT NULL,
    ruc varchar(11) NOT NULL,
    legal_address text NOT NULL,
    ubigeo_id varchar(6) NOT NULL,
    phone varchar(20) NOT NULL,
    email varchar(255) NOT NULL,
    website varchar(255),
    logo_url text,
    business_description text,
    facebook_url varchar(255),
    instagram_url varchar(255),
    twitter_url varchar(255),
    tiktok_url varchar(255),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT business_info_pk PRIMARY KEY (id),
    CONSTRAINT business_info_single_row_check CHECK (id = 1),
    CONSTRAINT business_info_ubigeo_fk FOREIGN KEY (ubigeo_id)
        REFERENCES public.ubigeos (id) MATCH SIMPLE
        ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE INDEX idx_business_info_ubigeo ON public.business_info USING btree (ubigeo_id);

CREATE TABLE public.storefront_settings (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    storefront_name varchar(255) NOT NULL,
    logo_url text,
    favicon_url text,
    primary_color varchar(7) NOT NULL DEFAULT '#04213bff',
    secondary_color varchar(7) NOT NULL DEFAULT '#f2f2f2ff',
    terms_and_conditions text,
    privacy_policy text,
    return_policy text,
    shipping_policy text,
    support_email varchar(255),
    support_phone varchar(20),
    whatsapp_number varchar(20),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT storefront_settings_pk PRIMARY KEY (id),
    CONSTRAINT storefront_settings_single_row_check CHECK (id = 1)
);
