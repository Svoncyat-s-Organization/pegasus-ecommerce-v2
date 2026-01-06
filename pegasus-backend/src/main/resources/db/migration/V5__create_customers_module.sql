-- ============================================
-- Module: CUSTOMERS
-- Tables: customers, customer_addresses
-- Dependencies: ubigeos
-- ============================================

CREATE TABLE public.customers (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    username varchar(50) NOT NULL,
    email varchar(255) NOT NULL,
    password_hash varchar(255) NOT NULL,
    doc_type varchar(10) NOT NULL,
    doc_number varchar(20) NOT NULL,
    first_name varchar(100) NOT NULL,
    last_name varchar(100) NOT NULL,
    phone varchar(20),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customers_pk PRIMARY KEY (id),
    CONSTRAINT customers_email_uq UNIQUE (email),
    CONSTRAINT customers_username_uq UNIQUE (username),
    CONSTRAINT customers_doc_number_uq UNIQUE (doc_number),
    CONSTRAINT customers_doc_type_check CHECK (doc_type IN ('DNI', 'CE'))
);
COMMENT ON COLUMN public.customers.doc_type IS 'Tipo de documento: DNI, CE';

CREATE UNIQUE INDEX idx_customers_email_lowercase ON public.customers USING btree ((LOWER(email)));

CREATE TABLE public.customer_addresses (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    customer_id bigint NOT NULL,
    ubigeo_id varchar(6) NOT NULL,
    address varchar(255) NOT NULL,
    reference text,
    postal_code varchar(20),
    is_default_shipping boolean NOT NULL DEFAULT false,
    is_default_billing boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customer_addresses_pk PRIMARY KEY (id),
    CONSTRAINT customer_addresses_customer_fk FOREIGN KEY (customer_id)
        REFERENCES public.customers (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT customer_addresses_ubigeo_fk FOREIGN KEY (ubigeo_id)
        REFERENCES public.ubigeos (id) MATCH SIMPLE
        ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE UNIQUE INDEX idx_customer_default_shipping_uq ON public.customer_addresses USING btree (customer_id) WHERE (is_default_shipping = TRUE);
CREATE UNIQUE INDEX idx_customer_default_billing_uq ON public.customer_addresses USING btree (customer_id) WHERE (is_default_billing = TRUE);
