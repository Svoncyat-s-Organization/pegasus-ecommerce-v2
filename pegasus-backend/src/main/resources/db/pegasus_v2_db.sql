-- ============================================
-- Pegasus E-commerce v2 - Database Schema
-- Final consolidated schema (clean, no migrations)
-- PostgreSQL 16+
-- ============================================

SET search_path TO pg_catalog, public;

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- RBAC: Users, Roles, Modules
-- ============================================

CREATE TABLE public.users (
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
    CONSTRAINT users_pk PRIMARY KEY (id),
    CONSTRAINT users_email_uq UNIQUE (email),
    CONSTRAINT users_username_uq UNIQUE (username),
    CONSTRAINT users_doc_number_uq UNIQUE (doc_number),
    CONSTRAINT users_doc_type_check CHECK (doc_type IN ('DNI', 'CE'))
);
COMMENT ON COLUMN public.users.doc_type IS 'Tipo de documento: DNI, CE';

CREATE TABLE public.roles (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    name varchar(50) NOT NULL,
    description varchar(255),
    CONSTRAINT roles_pk PRIMARY KEY (id),
    CONSTRAINT roles_name_uq UNIQUE (name)
);

CREATE TABLE public.modules (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    icon varchar(50),
    name varchar(50) NOT NULL,
    path varchar(100) NOT NULL,
    CONSTRAINT modules_pk PRIMARY KEY (id)
);

CREATE TABLE public.roles_modules (
    id_roles bigint NOT NULL,
    id_modules bigint NOT NULL,
    CONSTRAINT roles_modules_pk PRIMARY KEY (id_roles, id_modules),
    CONSTRAINT roles_modules_roles_fk FOREIGN KEY (id_roles)
        REFERENCES public.roles (id) MATCH FULL
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT roles_modules_modules_fk FOREIGN KEY (id_modules)
        REFERENCES public.modules (id) MATCH FULL
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE public.roles_users (
    id_roles bigint NOT NULL,
    id_users bigint NOT NULL,
    CONSTRAINT roles_users_pk PRIMARY KEY (id_roles, id_users),
    CONSTRAINT roles_users_roles_fk FOREIGN KEY (id_roles)
        REFERENCES public.roles (id) MATCH FULL
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT roles_users_users_fk FOREIGN KEY (id_users)
        REFERENCES public.users (id) MATCH FULL
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================
-- CATALOG: Brands, Categories, Products, Variants, Images
-- ============================================

CREATE TABLE public.brands (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    name varchar(50) NOT NULL,
    slug varchar(50) NOT NULL,
    image_url varchar(255) NOT NULL,
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
    image_url text,
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
    embedding vector(384),
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
COMMENT ON COLUMN public.products.embedding IS 'Vector embedding (384 dims) for semantic search using all-MiniLM-L6-v2 model';

CREATE INDEX idx_products_spec ON public.products USING gin (specs);
CREATE INDEX idx_products_embedding ON public.products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

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

-- ============================================
-- LOCATIONS: Ubigeo (Peru)
-- ============================================

CREATE TABLE public.ubigeos (
    id varchar(6) NOT NULL,
    department_name varchar(50) NOT NULL,
    province_name varchar(50) NOT NULL,
    district_name varchar(50) NOT NULL,
    department_id varchar(2) GENERATED ALWAYS AS (SUBSTRING(id, 1, 2)) STORED,
    province_id varchar(4) GENERATED ALWAYS AS (SUBSTRING(id, 1, 4)) STORED,
    CONSTRAINT ubigeos_pk PRIMARY KEY (id)
);

CREATE INDEX idx_locations_department ON public.ubigeos USING btree (department_id);
CREATE INDEX idx_locations_province ON public.ubigeos USING btree (province_id);

-- ============================================
-- INVENTORY: Warehouses, Stocks, Movements
-- ============================================

CREATE TABLE public.warehouses (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    code varchar(50) NOT NULL,
    name varchar(100) NOT NULL,
    ubigeo_id varchar(6) NOT NULL,
    address varchar(255) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT warehouses_pk PRIMARY KEY (id),
    CONSTRAINT warehouses_ubigeo_fk FOREIGN KEY (ubigeo_id)
        REFERENCES public.ubigeos (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE public.stocks (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    warehouse_id bigint NOT NULL,
    variant_id bigint NOT NULL,
    quantity integer NOT NULL DEFAULT 0,
    reserved_quantity integer NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT stock_pk PRIMARY KEY (id),
    CONSTRAINT stocks_warehouse_variant_uq UNIQUE (warehouse_id, variant_id),
    CONSTRAINT check_quantity_positive CHECK (quantity >= 0),
    CONSTRAINT check_reserved_positive CHECK (reserved_quantity >= 0),
    CONSTRAINT stocks_warehouse_fk FOREIGN KEY (warehouse_id)
        REFERENCES public.warehouses (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT stocks_variant_fk FOREIGN KEY (variant_id)
        REFERENCES public.variants (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_stocks_variant ON public.stocks USING btree (variant_id);
CREATE INDEX idx_stocks_warehouse ON public.stocks USING btree (warehouse_id);

CREATE TABLE public.movements (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    variant_id bigint NOT NULL,
    warehouse_id bigint NOT NULL,
    quantity integer NOT NULL,
    balance integer NOT NULL,
    unit_cost numeric(12, 2),
    operation_type varchar(30) NOT NULL,
    description text,
    reference_id bigint NOT NULL,
    reference_table varchar(50) NOT NULL,
    user_id bigint,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT movement_pk PRIMARY KEY (id),
    CONSTRAINT movements_operation_type_check CHECK (operation_type IN (
        'INVENTORY_ADJUSTMENT', 'PURCHASE', 'SALE', 'RETURN',
        'CANCELLATION', 'TRANSFER_IN', 'TRANSFER_OUT'
    )),
    CONSTRAINT movements_warehouse_fk FOREIGN KEY (warehouse_id)
        REFERENCES public.warehouses (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT movements_variant_fk FOREIGN KEY (variant_id)
        REFERENCES public.variants (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT movements_user_fk FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON DELETE SET NULL ON UPDATE CASCADE
);
COMMENT ON COLUMN public.movements.quantity IS 'El cambio de la cantidad, puede ser negativa o positiva.';
COMMENT ON COLUMN public.movements.operation_type IS 'Tipo de operacion de inventario';

CREATE INDEX idx_movements_tables ON public.movements USING btree (reference_id, reference_table);
CREATE INDEX idx_modules_date ON public.movements USING btree (created_at);
CREATE INDEX idx_movements_variant_warehouse ON public.movements USING btree (variant_id, warehouse_id);

-- ============================================
-- CUSTOMERS: Customers, Addresses
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

-- ============================================
-- ORDERS: Orders, Items, Status Histories
-- ============================================

CREATE TABLE public.orders (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    order_number varchar(50) NOT NULL,
    customer_id bigint NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'PENDING',
    total numeric(12, 2) NOT NULL,
    shipping_address jsonb NOT NULL,
    billing_address jsonb,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT orders_pk PRIMARY KEY (id),
    CONSTRAINT orders_order_number_uq UNIQUE (order_number),
    CONSTRAINT orders_status_check CHECK (status IN (
        'PENDING', 'AWAIT_PAYMENT', 'PAID', 'PROCESSING',
        'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
    )),
    CONSTRAINT orders_customer_fk FOREIGN KEY (customer_id)
        REFERENCES public.customers (id) MATCH SIMPLE
        ON DELETE NO ACTION ON UPDATE CASCADE
);
COMMENT ON COLUMN public.orders.status IS 'Estado del pedido';
COMMENT ON COLUMN public.orders.is_active IS 'Indica si el pedido esta activo (soft delete)';

CREATE INDEX idx_orders_customer ON public.orders USING btree (customer_id);
CREATE INDEX idx_orders_order_number ON public.orders USING btree (order_number);
CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);

CREATE TABLE public.order_items (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    order_id bigint NOT NULL,
    product_id bigint NOT NULL,
    variant_id bigint NOT NULL,
    sku text NOT NULL,
    product_name text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12, 2) NOT NULL,
    total numeric(12, 2) NOT NULL,
    CONSTRAINT order_items_pk PRIMARY KEY (id),
    CONSTRAINT check_quantity_positive CHECK (quantity >= 0),
    CONSTRAINT order_items_order_fk FOREIGN KEY (order_id)
        REFERENCES public.orders (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT order_items_product_fk FOREIGN KEY (product_id)
        REFERENCES public.products (id) MATCH SIMPLE
        ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT order_items_variant_fk FOREIGN KEY (variant_id)
        REFERENCES public.variants (id) MATCH SIMPLE
        ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE TABLE public.order_status_histories (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    order_id bigint NOT NULL,
    comments text,
    status varchar(20) NOT NULL,
    created_by bigint,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT order_status_histories_pk PRIMARY KEY (id),
    CONSTRAINT order_status_histories_status_check CHECK (status IN (
        'PENDING', 'AWAIT_PAYMENT', 'PAID', 'PROCESSING',
        'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
    )),
    CONSTRAINT order_status_histories_orders_fk FOREIGN KEY (order_id)
        REFERENCES public.orders (id) MATCH SIMPLE
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT orders_user_fk FOREIGN KEY (created_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON DELETE SET NULL ON UPDATE CASCADE
);
COMMENT ON COLUMN public.order_status_histories.status IS 'Estado registrado en el historial';

-- ============================================
-- SETTINGS: Business Info, Storefront Settings
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
    hero_image_url text,
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

-- ============================================
-- PURCHASES: Suppliers, Purchases, Purchase Items
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

-- ============================================
-- LOGISTICS: Shipping Methods, Shipments, Tracking Events
-- ============================================

CREATE TABLE public.shipping_methods (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    name varchar(100) NOT NULL,
    description text NOT NULL,
    carrier varchar(100) NOT NULL,
    estimated_days_min integer NOT NULL,
    estimated_days_max integer NOT NULL,
    base_cost numeric(12, 2) NOT NULL,
    cost_per_kg numeric(12, 2) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT shipping_methods_pk PRIMARY KEY (id)
);

CREATE TABLE public.shipments (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    shipment_type varchar(10) NOT NULL,
    order_id bigint NOT NULL,
    rma_id bigint,
    shipping_method_id bigint NOT NULL,
    tracking_number varchar(100) NOT NULL,
    shipping_cost numeric(12, 2) NOT NULL,
    weight_kg numeric(8, 2) NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'PENDING',
    estimated_delivery_date timestamptz NOT NULL,
    shipping_address jsonb NOT NULL,
    recipient_name varchar(200) NOT NULL,
    recipient_phone varchar(20) NOT NULL,
    require_signature boolean NOT NULL DEFAULT false,
    package_quantity integer NOT NULL DEFAULT 1,
    notes text,
    shipped_at timestamptz,
    delivered_at timestamptz,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT shipments_pk PRIMARY KEY (id),
    CONSTRAINT shipments_order_fk FOREIGN KEY (order_id)
        REFERENCES public.orders (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT shipments_shipping_method_fk FOREIGN KEY (shipping_method_id)
        REFERENCES public.shipping_methods (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_shipments_order ON public.shipments USING btree (order_id);
CREATE INDEX idx_shipments_rma ON public.shipments USING btree (rma_id);
CREATE INDEX idx_shipments_shipping_method ON public.shipments USING btree (shipping_method_id);
CREATE INDEX idx_shipments_shipment_type ON public.shipments USING btree (shipment_type);
CREATE INDEX idx_shipments_status ON public.shipments USING btree (status);
CREATE INDEX idx_shipments_tracking_number ON public.shipments USING btree (tracking_number);
CREATE INDEX idx_shipments_type_order ON public.shipments USING btree (shipment_type, order_id);

CREATE TABLE public.tracking_events (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    shipment_id bigint NOT NULL,
    status varchar(20) NOT NULL,
    location varchar(200),
    description text NOT NULL,
    is_public boolean NOT NULL DEFAULT true,
    event_date timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by bigint NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tracking_events_pk PRIMARY KEY (id),
    CONSTRAINT tracking_events_shipment_fk FOREIGN KEY (shipment_id)
        REFERENCES public.shipments (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT tracking_events_created_by_fk FOREIGN KEY (created_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_tracking_events_shipment ON public.tracking_events USING btree (shipment_id);
CREATE INDEX idx_tracking_events_created_b ON public.tracking_events USING btree (created_by);
CREATE INDEX idx_tracking_events_event_date ON public.tracking_events USING btree (event_date DESC NULLS LAST);
CREATE INDEX idx_tracking_events_is_public ON public.tracking_events USING btree (is_public);

-- ============================================
-- RMA: Return Merchandise Authorization
-- ============================================

CREATE TABLE public.rmas (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    rma_number varchar(50) NOT NULL,
    order_id bigint NOT NULL,
    customer_id bigint NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'PENDING',
    reason varchar(30) NOT NULL,
    customer_comments text,
    staff_notes text,
    refund_method varchar(30),
    refund_amount numeric(12, 2),
    restocking_fee numeric(12, 2) NOT NULL DEFAULT 0,
    shipping_cost_refund numeric(12, 2) NOT NULL DEFAULT 0,
    approved_by bigint,
    approved_at timestamptz,
    received_at timestamptz,
    refunded_at timestamptz,
    closed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rmas_pk PRIMARY KEY (id),
    CONSTRAINT rmas_rma_number_uq UNIQUE (rma_number),
    CONSTRAINT rmas_status_check CHECK (status IN (
        'PENDING', 'APPROVED', 'REJECTED',
        'RECEIVED', 'PROCESSING', 'COMPLETED', 'CANCELLED'
    )),
    CONSTRAINT rmas_reason_check CHECK (reason IN (
        'DEFECTIVE', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'DAMAGED_SHIPPING',
        'CHANGED_MIND', 'SIZE_COLOR', 'LATE_DELIVERY', 'OTHER'
    )),
    CONSTRAINT rmas_refund_method_check CHECK (refund_method IS NULL OR refund_method IN (
        'ORIGINAL_PAYMENT', 'BANK_TRANSFER', 'STORE_CREDIT', 'EXCHANGE'
    )),
    CONSTRAINT check_refund_amount_positive CHECK (refund_amount >= 0),
    CONSTRAINT check_restocking_fee_positive CHECK (restocking_fee >= 0),
    CONSTRAINT check_shipping_cost_refund_positive CHECK (shipping_cost_refund >= 0),
    CONSTRAINT rmas_order_fk FOREIGN KEY (order_id)
        REFERENCES public.orders (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT rmas_customer_fk FOREIGN KEY (customer_id)
        REFERENCES public.customers (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT rmas_approved_by_fk FOREIGN KEY (approved_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON DELETE SET NULL ON UPDATE CASCADE
);
COMMENT ON TABLE public.rmas IS 'Main RMA (Return Merchandise Authorization) records. Each RMA represents a customer request to return items from an order.';
COMMENT ON COLUMN public.rmas.rma_number IS 'Unique RMA identifier for customer reference (e.g., RMA-2026-00001)';
COMMENT ON COLUMN public.rmas.status IS 'Estado de la solicitud RMA';
COMMENT ON COLUMN public.rmas.restocking_fee IS 'Fee charged for restocking returned items (typically for non-defective returns)';
COMMENT ON COLUMN public.rmas.shipping_cost_refund IS 'Amount of original shipping cost to refund (usually 0 unless company fault)';
COMMENT ON COLUMN public.rmas.refund_amount IS 'Total amount to refund = (sum of rma_items.refund_amount) - restocking_fee + shipping_cost_refund';

CREATE INDEX idx_rmas_order ON public.rmas USING btree (order_id);
CREATE INDEX idx_rmas_customer ON public.rmas USING btree (customer_id);
CREATE INDEX idx_rmas_status ON public.rmas USING btree (status);
CREATE INDEX idx_rmas_rma_number ON public.rmas USING btree (rma_number);
CREATE INDEX idx_rmas_created_at ON public.rmas USING btree (created_at DESC);
CREATE INDEX idx_rmas_approved_by ON public.rmas USING btree (approved_by);

-- Add FK from shipments to rmas (deferred until rmas table exists)
ALTER TABLE public.shipments ADD CONSTRAINT shipments_rma_fk
    FOREIGN KEY (rma_id)
    REFERENCES public.rmas (id) MATCH SIMPLE
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE public.rma_items (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    rma_id bigint NOT NULL,
    order_item_id bigint NOT NULL,
    variant_id bigint NOT NULL,
    quantity integer NOT NULL,
    item_condition varchar(20),
    inspection_notes text,
    refund_amount numeric(12, 2) NOT NULL,
    restock_approved boolean NOT NULL DEFAULT false,
    inspected_by bigint,
    inspected_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rma_items_pk PRIMARY KEY (id),
    CONSTRAINT check_quantity_positive CHECK (quantity > 0),
    CONSTRAINT check_refund_amount_positive CHECK (refund_amount >= 0),
    CONSTRAINT rma_items_condition_check CHECK (item_condition IS NULL OR item_condition IN (
        'UNOPENED', 'OPENED_UNUSED', 'USED_LIKE_NEW', 'USED_GOOD', 'DAMAGED', 'DEFECTIVE'
    )),
    CONSTRAINT rma_items_rma_fk FOREIGN KEY (rma_id)
        REFERENCES public.rmas (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT rma_items_order_item_fk FOREIGN KEY (order_item_id)
        REFERENCES public.order_items (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT rma_items_variant_fk FOREIGN KEY (variant_id)
        REFERENCES public.variants (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT rma_items_inspected_by_fk FOREIGN KEY (inspected_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON DELETE SET NULL ON UPDATE CASCADE
);
COMMENT ON TABLE public.rma_items IS 'Individual items being returned in an RMA. Links to original order_items and variants for tracking.';
COMMENT ON COLUMN public.rma_items.item_condition IS 'Condition assessed during inspection (NULL until inspection happens)';
COMMENT ON COLUMN public.rma_items.refund_amount IS 'Amount to refund for this item (quantity * unit_price or adjusted based on condition)';
COMMENT ON COLUMN public.rma_items.restock_approved IS 'Whether the item can be restocked for resale (based on condition)';

CREATE INDEX idx_rma_items_rma ON public.rma_items USING btree (rma_id);
CREATE INDEX idx_rma_items_order_item ON public.rma_items USING btree (order_item_id);
CREATE INDEX idx_rma_items_variant ON public.rma_items USING btree (variant_id);
CREATE INDEX idx_rma_items_inspected_by ON public.rma_items USING btree (inspected_by);

CREATE TABLE public.rma_status_histories (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    rma_id bigint NOT NULL,
    status varchar(20) NOT NULL,
    comments text,
    created_by bigint NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rma_status_histories_pk PRIMARY KEY (id),
    CONSTRAINT rma_status_histories_status_check CHECK (status IN (
        'PENDING', 'APPROVED', 'REJECTED',
        'RECEIVED', 'PROCESSING', 'COMPLETED', 'CANCELLED'
    )),
    CONSTRAINT rma_status_histories_rma_fk FOREIGN KEY (rma_id)
        REFERENCES public.rmas (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT rma_status_histories_created_by_fk FOREIGN KEY (created_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE
);
COMMENT ON TABLE public.rma_status_histories IS 'Audit trail of RMA status changes. Tracks who changed status and when.';
COMMENT ON COLUMN public.rma_status_histories.status IS 'Estado registrado en historial RMA';

CREATE INDEX idx_rma_status_histories_rma ON public.rma_status_histories USING btree (rma_id);
CREATE INDEX idx_rma_status_histories_created_by ON public.rma_status_histories USING btree (created_by);
CREATE INDEX idx_rma_status_histories_created_at ON public.rma_status_histories USING btree (created_at DESC);

-- ============================================
-- BILLING: Payment Methods, Invoices, Payments, Document Series
-- ============================================

CREATE TABLE public.payment_methods (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    name varchar(50) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payment_methods_pk PRIMARY KEY (id),
    CONSTRAINT payment_methods_name_uq UNIQUE (name)
);

CREATE TABLE public.document_series (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    document_type varchar(20) NOT NULL,
    series varchar(4) NOT NULL,
    current_number integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT document_series_pk PRIMARY KEY (id),
    CONSTRAINT document_series_uq UNIQUE (document_type, series),
    CONSTRAINT document_series_type_check CHECK (document_type IN ('BILL', 'INVOICE', 'CREDIT_NOTE'))
);

CREATE TABLE public.invoices (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    order_id bigint NOT NULL,
    series_id bigint,
    invoice_type varchar(20) NOT NULL,
    series varchar(4) NOT NULL,
    number varchar(8) NOT NULL,
    receiver_tax_id varchar(20) NOT NULL,
    receiver_name varchar(150) NOT NULL,
    subtotal numeric(12, 2) NOT NULL,
    tax_amount numeric(12, 2) NOT NULL,
    total_amount numeric(12, 2) NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'ISSUED',
    issued_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT invoices_pk PRIMARY KEY (id),
    CONSTRAINT invoices_series_number_uq UNIQUE (series, number),
    CONSTRAINT invoices_invoice_type_check CHECK (invoice_type IN ('BILL', 'INVOICE')),
    CONSTRAINT invoices_status_check CHECK (status IN ('ISSUED', 'CANCELLED', 'REJECTED')),
    CONSTRAINT invoices_amounts_check CHECK (subtotal >= 0 AND tax_amount >= 0 AND total_amount > 0 AND total_amount = subtotal + tax_amount),
    CONSTRAINT invoices_order_fk FOREIGN KEY (order_id)
        REFERENCES public.orders (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT invoices_series_fk FOREIGN KEY (series_id)
        REFERENCES public.document_series (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_invoices_issued_at ON public.invoices USING btree (issued_at);
CREATE INDEX idx_invoices_order_id ON public.invoices USING btree (order_id);

CREATE TABLE public.payments (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    order_id bigint NOT NULL,
    payment_method_id bigint NOT NULL,
    amount numeric(12, 2) NOT NULL,
    transaction_id varchar(100),
    payment_date timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_pk PRIMARY KEY (id),
    CONSTRAINT payments_amount_check CHECK (amount > 0),
    CONSTRAINT payments_order_fk FOREIGN KEY (order_id)
        REFERENCES public.orders (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT payments_method_fk FOREIGN KEY (payment_method_id)
        REFERENCES public.payment_methods (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);
CREATE INDEX idx_payments_payment_method_id ON public.payments USING btree (payment_method_id);

-- ============================================
-- END OF SCHEMA
-- ============================================
