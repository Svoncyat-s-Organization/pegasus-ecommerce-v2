-- ============================================
-- Module: PURCHASES
-- Tables: suppliers, purchases, purchase_items
-- Dependencies: ubigeos, warehouses, users, variants
-- ============================================

CREATE TABLE public.suppliers (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    doc_type varchar(3) NOT NULL,
    doc_number varchar(20) NOT NULL,
    company_name varchar(150) NOT NULL,
    contact_name varchar(100),
    phone varchar(20),
    email varchar(255),
    address text,
    ubigeo_id varchar(6),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT suppliers_pk PRIMARY KEY (id),
    CONSTRAINT suppliers_doc_number_uq UNIQUE (doc_number),
    CONSTRAINT suppliers_doc_type_check CHECK (doc_type IN ('DNI', 'RUC')),
    CONSTRAINT suppliers_ubigeo_fk FOREIGN KEY (ubigeo_id)
        REFERENCES public.ubigeos (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE public.purchases (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    supplier_id bigint NOT NULL,
    warehouse_id bigint NOT NULL,
    user_id bigint NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'PENDING',
    invoice_type varchar(20) NOT NULL,
    invoice_number varchar(50) NOT NULL,
    total_amount numeric(12, 2) NOT NULL DEFAULT 0,
    purchase_date date NOT NULL DEFAULT CURRENT_DATE,
    notes text,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT purchases_pk PRIMARY KEY (id),
    CONSTRAINT purchases_status_check CHECK (status IN ('PENDING', 'RECEIVED', 'CANCELLED')),
    CONSTRAINT purchases_supplier_fk FOREIGN KEY (supplier_id)
        REFERENCES public.suppliers (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT purchases_warehouse_fk FOREIGN KEY (warehouse_id)
        REFERENCES public.warehouses (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT purchases_user_fk FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE
);
COMMENT ON COLUMN public.purchases.status IS 'Estado de la orden de compra';

CREATE INDEX idx_purchases_supplier_id ON public.purchases USING btree (supplier_id);
CREATE INDEX idx_purchases_warehouse_id ON public.purchases USING btree (warehouse_id);

CREATE TABLE public.purchase_items (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    purchase_id bigint NOT NULL,
    variant_id bigint NOT NULL,
    quantity integer NOT NULL,
    unit_cost numeric(12, 2) NOT NULL,
    subtotal numeric(12, 2) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT purchase_items_pk PRIMARY KEY (id),
    CONSTRAINT purchase_items_quantity_check CHECK (quantity > 0),
    CONSTRAINT purchase_items_purchase_fk FOREIGN KEY (purchase_id)
        REFERENCES public.purchases (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT purchase_items_variant_fk FOREIGN KEY (variant_id)
        REFERENCES public.variants (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_purchase_items_variant_id ON public.purchase_items USING btree (variant_id);
