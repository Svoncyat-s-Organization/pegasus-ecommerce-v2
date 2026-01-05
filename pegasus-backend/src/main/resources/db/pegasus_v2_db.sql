-- ============================================
-- Pegasus E-commerce V2 - Database Schema
-- ============================================
-- This file represents the CURRENT state of the database schema
-- after all migrations (V1-V8) have been applied.
-- 
-- IMPORTANT: This file is for DOCUMENTATION purposes only.
-- It is NEVER executed by Flyway. All changes must be done via V__ migrations.
--
-- Last updated: 2026-01-05
-- Migrations applied: V1 through V8
-- ============================================

SET search_path TO pg_catalog, public;

-- ============================================
-- ENUMS (RMA-specific, kept as PostgreSQL types)
-- ============================================

-- RMA Reason Enum
CREATE TYPE public.rma_reason_enum AS
ENUM ('DEFECTIVE', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'DAMAGED_SHIPPING', 'CHANGED_MIND', 'SIZE_COLOR', 'LATE_DELIVERY', 'OTHER');
ALTER TYPE public.rma_reason_enum OWNER TO postgres;
COMMENT ON TYPE public.rma_reason_enum IS 'Return reasons: DEFECTIVE (product broken), WRONG_ITEM (wrong product sent), NOT_AS_DESCRIBED (does not match description), DAMAGED_SHIPPING (damaged during delivery), CHANGED_MIND (customer regret), SIZE_COLOR (wrong size/color), LATE_DELIVERY (arrived too late), OTHER (custom reason)';

-- Item Condition Enum
CREATE TYPE public.item_condition_enum AS
ENUM ('UNOPENED', 'OPENED_UNUSED', 'USED_LIKE_NEW', 'USED_GOOD', 'DAMAGED', 'DEFECTIVE');
ALTER TYPE public.item_condition_enum OWNER TO postgres;
COMMENT ON TYPE public.item_condition_enum IS 'Condition of returned item upon inspection: UNOPENED (sealed), OPENED_UNUSED (opened but not used), USED_LIKE_NEW (minimal use), USED_GOOD (normal wear), DAMAGED (physical damage), DEFECTIVE (not working)';

-- Refund Method Enum
CREATE TYPE public.refund_method_enum AS
ENUM ('ORIGINAL_PAYMENT', 'BANK_TRANSFER', 'STORE_CREDIT', 'EXCHANGE');
ALTER TYPE public.refund_method_enum OWNER TO postgres;
COMMENT ON TYPE public.refund_method_enum IS 'How the refund will be processed: ORIGINAL_PAYMENT (same payment method), BANK_TRANSFER (bank account), STORE_CREDIT (credit for future purchases), EXCHANGE (product exchange)';

-- Invoice Status Enum
CREATE TYPE public.invoice_status_enum AS
ENUM ('ISSUED', 'CANCELLED', 'REJECTED');
ALTER TYPE public.invoice_status_enum OWNER TO postgres;

-- ============================================
-- TABLES: Security Module
-- ============================================

-- Users (Backoffice Staff)
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
    CONSTRAINT users_docNumber_uq UNIQUE (doc_number),
    CONSTRAINT users_doc_type_check CHECK (doc_type IN ('DNI', 'CE'))
);
ALTER TABLE public.users OWNER TO postgres;
COMMENT ON COLUMN public.users.doc_type IS 'Tipo de documento: DNI, CE';

-- Roles
CREATE TABLE public.roles (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    name varchar(50) NOT NULL,
    description varchar(255),
    CONSTRAINT roles_pk PRIMARY KEY (id),
    CONSTRAINT roles_name_uq UNIQUE (name)
);
ALTER TABLE public.roles OWNER TO postgres;

-- Modules
CREATE TABLE public.modules (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    icon varchar(50),
    name varchar(50) NOT NULL,
    path varchar(100) NOT NULL,
    CONSTRAINT modules_pk PRIMARY KEY (id)
);
ALTER TABLE public.modules OWNER TO postgres;

-- Roles-Modules Junction
CREATE TABLE public.roles_modules (
    id_roles bigint NOT NULL,
    id_modules bigint NOT NULL,
    CONSTRAINT roles_modules_pk PRIMARY KEY (id_roles, id_modules)
);

-- Roles-Users Junction
CREATE TABLE public.roles_users (
    id_roles bigint NOT NULL,
    id_users bigint NOT NULL,
    CONSTRAINT roles_users_pk PRIMARY KEY (id_roles, id_users)
);

-- ============================================
-- TABLES: Locations Module (Ubigeo)
-- ============================================

-- Ubigeos (Peru Location System)
CREATE TABLE public.ubigeos (
    id varchar(6) NOT NULL,
    department_name varchar(50) NOT NULL,
    province_name varchar(50) NOT NULL,
    district_name varchar(50) NOT NULL,
    department_id varchar(2) GENERATED ALWAYS AS (SUBSTRING(id, 1, 2)) STORED,
    province_id varchar(4) GENERATED ALWAYS AS (SUBSTRING(id, 1, 4)) STORED,
    CONSTRAINT ubigeos_pk PRIMARY KEY (id)
);
ALTER TABLE public.ubigeos OWNER TO postgres;

-- ============================================
-- TABLES: Catalog Module
-- ============================================

-- Brands
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
ALTER TABLE public.brands OWNER TO postgres;

-- Categories
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
    CONSTRAINT categories_slug_uq UNIQUE (slug)
);
ALTER TABLE public.categories OWNER TO postgres;

-- Products
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
    CONSTRAINT products_slug_uq UNIQUE (slug)
);
ALTER TABLE public.products OWNER TO postgres;

-- Variants
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
    CONSTRAINT variants_sku_uq UNIQUE (sku)
);
ALTER TABLE public.variants OWNER TO postgres;

-- Images
CREATE TABLE public.images (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    image_url varchar(255) NOT NULL,
    product_id bigint NOT NULL,
    variant_id bigint,
    is_primary boolean NOT NULL DEFAULT false,
    display_order integer NOT NULL DEFAULT 0,
    CONSTRAINT images_pk PRIMARY KEY (id)
);
ALTER TABLE public.images OWNER TO postgres;

-- ============================================
-- TABLES: Inventory Module
-- ============================================

-- Warehouses
CREATE TABLE public.warehouses (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    code varchar(50) NOT NULL,
    name varchar(100) NOT NULL,
    ubigeo_id varchar(6) NOT NULL,
    address varchar(255) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT warehouses_pk PRIMARY KEY (id)
);
ALTER TABLE public.warehouses OWNER TO postgres;

-- Stocks
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
    CONSTRAINT check_reserved_positive CHECK (reserved_quantity >= 0)
);
ALTER TABLE public.stocks OWNER TO postgres;

-- Movements
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
    user_id bigint NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT movement_pk PRIMARY KEY (id),
    CONSTRAINT movements_operation_type_check CHECK (operation_type IN (
        'INVENTORY_ADJUSTMENT', 'PURCHASE', 'SALE', 'RETURN',
        'CANCELLATION', 'TRANSFER_IN', 'TRANSFER_OUT'
    ))
);
ALTER TABLE public.movements OWNER TO postgres;
COMMENT ON COLUMN public.movements.quantity IS 'El cambio de la cantidad, puede ser negativa o positiva.';
COMMENT ON COLUMN public.movements.operation_type IS 'Tipo de operación de inventario';

-- ============================================
-- TABLES: Customer Module
-- ============================================

-- Customers
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
    CONSTRAINT customers_docNumber_uq UNIQUE (doc_number),
    CONSTRAINT customers_doc_type_check CHECK (doc_type IN ('DNI', 'CE'))
);
ALTER TABLE public.customers OWNER TO postgres;
COMMENT ON COLUMN public.customers.doc_type IS 'Tipo de documento: DNI, CE';

-- Customer Addresses
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
    CONSTRAINT customer_addresses_pk PRIMARY KEY (id)
);
ALTER TABLE public.customer_addresses OWNER TO postgres;

-- ============================================
-- TABLES: Order Module
-- ============================================

-- Orders
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
    CONSTRAINT orders_orderNumber_uq UNIQUE (order_number),
    CONSTRAINT orders_status_check CHECK (status IN (
        'PENDING', 'AWAIT_PAYMENT', 'PAID', 'PROCESSING',
        'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
    ))
);
ALTER TABLE public.orders OWNER TO postgres;
COMMENT ON COLUMN public.orders.status IS 'Estado del pedido';
COMMENT ON COLUMN public.orders.is_active IS 'Indica si el pedido está activo (soft delete)';

-- Order Items
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
    CONSTRAINT check_quantity_positive CHECK (quantity >= 0)
);
ALTER TABLE public.order_items OWNER TO postgres;

-- Order Status Histories
CREATE TABLE public.order_status_histories (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    order_id bigint NOT NULL,
    comments text,
    status varchar(20) NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT order_status_histories_pk PRIMARY KEY (id),
    CONSTRAINT order_status_histories_status_check CHECK (status IN (
        'PENDING', 'AWAIT_PAYMENT', 'PAID', 'PROCESSING',
        'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
    ))
);
ALTER TABLE public.order_status_histories OWNER TO postgres;
COMMENT ON COLUMN public.order_status_histories.status IS 'Estado registrado en el historial';

-- ============================================
-- TABLES: Purchase Module
-- ============================================

-- Suppliers
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
    CONSTRAINT suppliers_doc_type_check CHECK (doc_type IN ('DNI', 'RUC'))
);
ALTER TABLE public.suppliers OWNER TO postgres;

-- Purchases
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
    CONSTRAINT purchases_status_check CHECK (status IN ('PENDING', 'RECEIVED', 'CANCELLED'))
);
ALTER TABLE public.purchases OWNER TO postgres;
COMMENT ON COLUMN public.purchases.status IS 'Estado de la orden de compra';

-- Purchase Items
CREATE TABLE public.purchase_items (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    purchase_id bigint NOT NULL,
    variant_id bigint NOT NULL,
    quantity integer NOT NULL,
    unit_cost numeric(12, 2) NOT NULL,
    subtotal numeric(12, 2) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT purchase_items_pk PRIMARY KEY (id),
    CONSTRAINT purchase_items_quantity_check CHECK (quantity > 0)
);
ALTER TABLE public.purchase_items OWNER TO postgres;

-- ============================================
-- TABLES: Billing Module
-- ============================================

-- Payment Methods
CREATE TABLE public.payment_methods (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    name varchar(50) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payment_methods_pk PRIMARY KEY (id),
    CONSTRAINT payment_methods_name_uq UNIQUE (name)
);
ALTER TABLE public.payment_methods OWNER TO postgres;

-- Document Series
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
ALTER TABLE public.document_series OWNER TO postgres;

-- Invoices
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
    status public.invoice_status_enum NOT NULL DEFAULT 'ISSUED',
    issued_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT invoices_pk PRIMARY KEY (id),
    CONSTRAINT invoices_series_number_uq UNIQUE (series, number),
    CONSTRAINT invoices_invoice_type_check CHECK (invoice_type IN ('BILL', 'INVOICE')),
    CONSTRAINT invoices_amounts_check CHECK (subtotal >= 0 AND tax_amount >= 0 AND total_amount > 0 AND total_amount = subtotal + tax_amount)
);
ALTER TABLE public.invoices OWNER TO postgres;

-- Payments
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
    CONSTRAINT payments_amount_check CHECK (amount > 0)
);
ALTER TABLE public.payments OWNER TO postgres;

-- ============================================
-- TABLES: Logistics Module
-- ============================================

-- Shipping Methods
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
ALTER TABLE public.shipping_methods OWNER TO postgres;

-- Shipments
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
    CONSTRAINT shipments_pk PRIMARY KEY (id)
);
ALTER TABLE public.shipments OWNER TO postgres;

-- Tracking Events
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
    CONSTRAINT tracking_events_pk PRIMARY KEY (id)
);
ALTER TABLE public.tracking_events OWNER TO postgres;

-- ============================================
-- TABLES: RMA Module
-- ============================================

-- RMAs (Return Merchandise Authorization)
CREATE TABLE public.rmas (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    rma_number varchar(50) NOT NULL,
    order_id bigint NOT NULL,
    customer_id bigint NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'PENDING',
    reason public.rma_reason_enum NOT NULL,
    customer_comments text,
    staff_notes text,
    refund_method public.refund_method_enum,
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
    CONSTRAINT check_refund_amount_positive CHECK (refund_amount >= 0),
    CONSTRAINT check_restocking_fee_positive CHECK (restocking_fee >= 0),
    CONSTRAINT check_shipping_cost_refund_positive CHECK (shipping_cost_refund >= 0),
    CONSTRAINT rmas_status_check CHECK (status IN (
        'PENDING', 'APPROVED', 'REJECTED',
        'RECEIVED', 'PROCESSING', 'COMPLETED', 'CANCELLED'
    ))
);
ALTER TABLE public.rmas OWNER TO postgres;
COMMENT ON TABLE public.rmas IS 'Main RMA (Return Merchandise Authorization) records. Each RMA represents a customer request to return items from an order.';
COMMENT ON COLUMN public.rmas.rma_number IS 'Unique RMA identifier for customer reference (e.g., RMA-2026-00001)';
COMMENT ON COLUMN public.rmas.restocking_fee IS 'Fee charged for restocking returned items (typically for non-defective returns)';
COMMENT ON COLUMN public.rmas.shipping_cost_refund IS 'Amount of original shipping cost to refund (usually 0 unless company fault)';
COMMENT ON COLUMN public.rmas.refund_amount IS 'Total amount to refund = (sum of rma_items.refund_amount) - restocking_fee + shipping_cost_refund';
COMMENT ON COLUMN public.rmas.status IS 'Estado de la solicitud RMA';

-- RMA Items
CREATE TABLE public.rma_items (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    rma_id bigint NOT NULL,
    order_item_id bigint NOT NULL,
    variant_id bigint NOT NULL,
    quantity integer NOT NULL,
    item_condition public.item_condition_enum,
    inspection_notes text,
    refund_amount numeric(12, 2) NOT NULL,
    restock_approved boolean NOT NULL DEFAULT false,
    inspected_by bigint,
    inspected_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rma_items_pk PRIMARY KEY (id),
    CONSTRAINT check_quantity_positive CHECK (quantity > 0),
    CONSTRAINT check_refund_amount_positive CHECK (refund_amount >= 0)
);
ALTER TABLE public.rma_items OWNER TO postgres;
COMMENT ON TABLE public.rma_items IS 'Individual items being returned in an RMA. Links to original order_items and variants for tracking.';
COMMENT ON COLUMN public.rma_items.item_condition IS 'Condition assessed during inspection (NULL until inspection happens)';
COMMENT ON COLUMN public.rma_items.refund_amount IS 'Amount to refund for this item (quantity * unit_price or adjusted based on condition)';
COMMENT ON COLUMN public.rma_items.restock_approved IS 'Whether the item can be restocked for resale (based on condition)';

-- RMA Status Histories
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
    ))
);
ALTER TABLE public.rma_status_histories OWNER TO postgres;
COMMENT ON TABLE public.rma_status_histories IS 'Audit trail of RMA status changes. Tracks who changed status and when.';
COMMENT ON COLUMN public.rma_status_histories.status IS 'Estado registrado en historial RMA';

-- ============================================
-- TABLES: Settings Module
-- ============================================

-- Business Info
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
    CONSTRAINT business_info_single_row_check CHECK (id = 1)
);
ALTER TABLE public.business_info OWNER TO postgres;

-- Storefront Settings
CREATE TABLE public.storefront_settings (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    storefront_name varchar(255) NOT NULL,
    logo_url text,
    favicon_url text,
    primary_color varchar(7) NOT NULL DEFAULT '#04213b',
    secondary_color varchar(7) NOT NULL DEFAULT '#f2f2f2',
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
ALTER TABLE public.storefront_settings OWNER TO postgres;

-- ============================================
-- INDEXES
-- ============================================

-- Ubigeos
CREATE INDEX idx_locations_province ON public.ubigeos USING btree (province_id);
CREATE INDEX idx_locations_department ON public.ubigeos USING btree (department_id);

-- Products & Variants
CREATE INDEX idx_products_spec ON public.products USING gin (specs);
CREATE INDEX idx_variants_attributes ON public.variants USING gin (attributes);

-- Stocks
CREATE INDEX idx_stocks_variant ON public.stocks USING btree (variant_id);
CREATE INDEX idx_stocks_warehouse ON public.stocks USING btree (warehouse_id);

-- Movements
CREATE INDEX idx_movements_tables ON public.movements USING btree (reference_id, reference_table);
CREATE INDEX idx_modules_date ON public.movements USING btree (created_at);
CREATE INDEX idx_movements_variant_warehouse ON public.movements USING btree (variant_id, warehouse_id);

-- Customers
CREATE UNIQUE INDEX idx_customers_email_lowercase ON public.customers USING btree ((LOWER(email)));
CREATE UNIQUE INDEX idx_customer_default_shipping_uq ON public.customer_addresses USING btree (customer_id) WHERE (is_default_shipping = TRUE);
CREATE UNIQUE INDEX idx_customer_default_billing_uq ON public.customer_addresses USING btree (customer_id) WHERE (is_default_billing = TRUE);

-- Orders
CREATE INDEX idx_orders_customer ON public.orders USING btree (customer_id);
CREATE INDEX idx_orders_orderNumber ON public.orders USING btree (order_number);
CREATE INDEX idx_orders_createdAt ON public.orders USING btree (created_at);

-- Purchases
CREATE INDEX idx_purchases_supplier_id ON public.purchases USING btree (supplier_id);
CREATE INDEX idx_purchases_warehouse_id ON public.purchases USING btree (warehouse_id);
CREATE INDEX idx_purchase_items_variant_id ON public.purchase_items USING btree (variant_id);

-- Billing
CREATE INDEX idx_invoices_issued_at ON public.invoices USING btree (issued_at);
CREATE INDEX idx_invoices_order_id ON public.invoices USING btree (order_id);
CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);
CREATE INDEX idx_payments_payment_method_id ON public.payments USING btree (payment_method_id);

-- Shipments & Tracking
CREATE INDEX idx_shipments_order ON public.shipments USING btree (order_id);
CREATE INDEX idx_shipments_rma ON public.shipments USING btree (rma_id);
CREATE INDEX idx_shipments_shipping_method ON public.shipments USING btree (shipping_method_id);
CREATE INDEX idx_shipments_shipment_type ON public.shipments USING btree (shipment_type);
CREATE INDEX idx_shipments_status ON public.shipments USING btree (status);
CREATE INDEX idx_shipments_tracking_number ON public.shipments USING btree (tracking_number);
CREATE INDEX idx_shipments_type_order ON public.shipments USING btree (shipment_type, order_id);
CREATE INDEX idx_tracking_events_shipment ON public.tracking_events USING btree (shipment_id);
CREATE INDEX idx_tracking_events_created_b ON public.tracking_events USING btree (created_by);
CREATE INDEX idx_tracking_events_event_date ON public.tracking_events USING btree (event_date DESC NULLS LAST);
CREATE INDEX idx_tracking_events_is_public ON public.tracking_events USING btree (is_public);

-- RMA
CREATE INDEX idx_rmas_order ON public.rmas USING btree (order_id);
CREATE INDEX idx_rmas_customer ON public.rmas USING btree (customer_id);
CREATE INDEX idx_rmas_status ON public.rmas USING btree (status);
CREATE INDEX idx_rmas_rma_number ON public.rmas USING btree (rma_number);
CREATE INDEX idx_rmas_created_at ON public.rmas USING btree (created_at DESC);
CREATE INDEX idx_rmas_approved_by ON public.rmas USING btree (approved_by);
CREATE INDEX idx_rma_items_rma ON public.rma_items USING btree (rma_id);
CREATE INDEX idx_rma_items_order_item ON public.rma_items USING btree (order_item_id);
CREATE INDEX idx_rma_items_variant ON public.rma_items USING btree (variant_id);
CREATE INDEX idx_rma_items_inspected_by ON public.rma_items USING btree (inspected_by);
CREATE INDEX idx_rma_status_histories_rma ON public.rma_status_histories USING btree (rma_id);
CREATE INDEX idx_rma_status_histories_created_by ON public.rma_status_histories USING btree (created_by);
CREATE INDEX idx_rma_status_histories_created_at ON public.rma_status_histories USING btree (created_at DESC);

-- Settings
CREATE INDEX idx_business_info_ubigeo ON public.business_info USING btree (ubigeo_id);

-- ============================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================

-- Security Module
ALTER TABLE public.roles_modules ADD CONSTRAINT roles_fk FOREIGN KEY (id_roles)
    REFERENCES public.roles (id) MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.roles_modules ADD CONSTRAINT modules_fk FOREIGN KEY (id_modules)
    REFERENCES public.modules (id) MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.roles_users ADD CONSTRAINT roles_fk FOREIGN KEY (id_roles)
    REFERENCES public.roles (id) MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.roles_users ADD CONSTRAINT users_fk FOREIGN KEY (id_users)
    REFERENCES public.users (id) MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;

-- Catalog Module
ALTER TABLE public.categories ADD CONSTRAINT categories_parentId_fk FOREIGN KEY (parent_id)
    REFERENCES public.categories (id) MATCH SIMPLE ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE public.products ADD CONSTRAINT products_brand_fk FOREIGN KEY (brand_id)
    REFERENCES public.brands (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.products ADD CONSTRAINT products_category_fk FOREIGN KEY (category_id)
    REFERENCES public.categories (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.variants ADD CONSTRAINT variants_product_fk FOREIGN KEY (product_id)
    REFERENCES public.products (id) MATCH SIMPLE ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.images ADD CONSTRAINT images_product_fk FOREIGN KEY (product_id)
    REFERENCES public.products (id) MATCH SIMPLE ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.images ADD CONSTRAINT images_variant_fk FOREIGN KEY (variant_id)
    REFERENCES public.variants (id) MATCH SIMPLE ON DELETE CASCADE ON UPDATE CASCADE;

-- Inventory Module
ALTER TABLE public.warehouses ADD CONSTRAINT warehouses_ubigeo_fk FOREIGN KEY (ubigeo_id)
    REFERENCES public.ubigeos (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.stocks ADD CONSTRAINT stocks_warehouse_fk FOREIGN KEY (warehouse_id)
    REFERENCES public.warehouses (id) MATCH SIMPLE ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.stocks ADD CONSTRAINT stocks_variant_fk FOREIGN KEY (variant_id)
    REFERENCES public.variants (id) MATCH SIMPLE ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.movements ADD CONSTRAINT movements_warehouse_fk FOREIGN KEY (warehouse_id)
    REFERENCES public.warehouses (id) MATCH SIMPLE ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.movements ADD CONSTRAINT movements_variant_fk FOREIGN KEY (variant_id)
    REFERENCES public.variants (id) MATCH SIMPLE ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.movements ADD CONSTRAINT movements_user_fk FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;

-- Customer Module
ALTER TABLE public.customer_addresses ADD CONSTRAINT customer_addresses_ubigeo_fk FOREIGN KEY (ubigeo_id)
    REFERENCES public.ubigeos (id) MATCH SIMPLE ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE public.customer_addresses ADD CONSTRAINT customer_addresses_customer_fk FOREIGN KEY (customer_id)
    REFERENCES public.customers (id) MATCH SIMPLE ON DELETE CASCADE ON UPDATE CASCADE;

-- Order Module
ALTER TABLE public.orders ADD CONSTRAINT orders_customer_fk FOREIGN KEY (customer_id)
    REFERENCES public.customers (id) MATCH SIMPLE ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_order_fk FOREIGN KEY (order_id)
    REFERENCES public.orders (id) MATCH SIMPLE ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_fk FOREIGN KEY (product_id)
    REFERENCES public.products (id) MATCH SIMPLE ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_variant_fk FOREIGN KEY (variant_id)
    REFERENCES public.variants (id) MATCH SIMPLE ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE public.order_status_histories ADD CONSTRAINT order_status_histories_orders_fk FOREIGN KEY (order_id)
    REFERENCES public.orders (id) MATCH SIMPLE ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE public.order_status_histories ADD CONSTRAINT orders_user_fk FOREIGN KEY (created_by)
    REFERENCES public.users (id) MATCH SIMPLE ON DELETE NO ACTION ON UPDATE CASCADE;

-- Purchase Module
ALTER TABLE public.suppliers ADD CONSTRAINT suppliers_ubigeo_fk FOREIGN KEY (ubigeo_id)
    REFERENCES public.ubigeos (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.purchases ADD CONSTRAINT purchases_supplier_fk FOREIGN KEY (supplier_id)
    REFERENCES public.suppliers (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.purchases ADD CONSTRAINT purchases_warehouse_fk FOREIGN KEY (warehouse_id)
    REFERENCES public.warehouses (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.purchases ADD CONSTRAINT purchases_user_fk FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.purchase_items ADD CONSTRAINT purchase_items_purchase_fk FOREIGN KEY (purchase_id)
    REFERENCES public.purchases (id) MATCH SIMPLE ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.purchase_items ADD CONSTRAINT purchase_items_variant_fk FOREIGN KEY (variant_id)
    REFERENCES public.variants (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;

-- Billing Module
ALTER TABLE public.invoices ADD CONSTRAINT invoices_order_fk FOREIGN KEY (order_id)
    REFERENCES public.orders (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_series_fk FOREIGN KEY (series_id)
    REFERENCES public.document_series (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.payments ADD CONSTRAINT payments_order_fk FOREIGN KEY (order_id)
    REFERENCES public.orders (id) MATCH SIMPLE ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.payments ADD CONSTRAINT payments_method_fk FOREIGN KEY (payment_method_id)
    REFERENCES public.payment_methods (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;

-- Logistics Module
ALTER TABLE public.shipments ADD CONSTRAINT shipments_order_fk FOREIGN KEY (order_id)
    REFERENCES public.orders (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.shipments ADD CONSTRAINT shipments_shipping_method_fk FOREIGN KEY (shipping_method_id)
    REFERENCES public.shipping_methods (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.shipments ADD CONSTRAINT shipments_rma_fk FOREIGN KEY (rma_id)
    REFERENCES public.rmas (id) MATCH SIMPLE ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.tracking_events ADD CONSTRAINT tracking_events_shipment_fk FOREIGN KEY (shipment_id)
    REFERENCES public.shipments (id) MATCH SIMPLE ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.tracking_events ADD CONSTRAINT tracking_events_created_by_fk FOREIGN KEY (created_by)
    REFERENCES public.users (id) MATCH SIMPLE ON DELETE SET NULL ON UPDATE CASCADE;

-- RMA Module
ALTER TABLE public.rmas ADD CONSTRAINT rmas_order_fk FOREIGN KEY (order_id)
    REFERENCES public.orders (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.rmas ADD CONSTRAINT rmas_customer_fk FOREIGN KEY (customer_id)
    REFERENCES public.customers (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.rmas ADD CONSTRAINT rmas_approved_by_fk FOREIGN KEY (approved_by)
    REFERENCES public.users (id) MATCH SIMPLE ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.rma_items ADD CONSTRAINT rma_items_rma_fk FOREIGN KEY (rma_id)
    REFERENCES public.rmas (id) MATCH SIMPLE ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.rma_items ADD CONSTRAINT rma_items_order_item_fk FOREIGN KEY (order_item_id)
    REFERENCES public.order_items (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.rma_items ADD CONSTRAINT rma_items_variant_fk FOREIGN KEY (variant_id)
    REFERENCES public.variants (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.rma_items ADD CONSTRAINT rma_items_inspected_by_fk FOREIGN KEY (inspected_by)
    REFERENCES public.users (id) MATCH SIMPLE ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.rma_status_histories ADD CONSTRAINT rma_status_histories_rma_fk FOREIGN KEY (rma_id)
    REFERENCES public.rmas (id) MATCH SIMPLE ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.rma_status_histories ADD CONSTRAINT rma_status_histories_created_by_fk FOREIGN KEY (created_by)
    REFERENCES public.users (id) MATCH SIMPLE ON DELETE RESTRICT ON UPDATE CASCADE;

-- Settings Module
ALTER TABLE public.business_info ADD CONSTRAINT business_info_ubigeo_fk FOREIGN KEY (ubigeo_id)
    REFERENCES public.ubigeos (id) MATCH SIMPLE ON DELETE NO ACTION ON UPDATE CASCADE;

-- ============================================
-- END OF SCHEMA
-- ============================================
