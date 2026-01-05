-- ** Database generated with pgModeler (PostgreSQL Database Modeler).
-- ** pgModeler version: 2.0.0-alpha
-- ** PostgreSQL version: 18.0
-- ** Project Site: pgmodeler.io
-- ** Model Author: ---

-- ** Database creation must be performed outside a multi lined SQL file. 
-- ** These commands were put in this file only as a convenience.

-- object: pegasus_v2_db | type: DATABASE --
-- DROP DATABASE IF EXISTS pegasus_v2_db;
-- CREATE DATABASE pegasus_v2_db;
-- ddl-end --


SET search_path TO pg_catalog,public;
-- ddl-end --

-- object: public.document_type_enum | type: TYPE --
-- DROP TYPE IF EXISTS public.document_type_enum CASCADE;
CREATE TYPE public.document_type_enum AS
ENUM ('DNI','CE');
-- ddl-end --
ALTER TYPE public.document_type_enum OWNER TO postgres;
-- ddl-end --

-- object: public.users | type: TABLE --
-- DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	username varchar(50) NOT NULL,
	email varchar(255) NOT NULL,
	password_hash varchar(255) NOT NULL,
	doc_type public.document_type_enum NOT NULL,
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
	CONSTRAINT "users_docNumber_uq" UNIQUE (doc_number)
);
-- ddl-end --
ALTER TABLE public.users OWNER TO postgres;
-- ddl-end --

-- object: public.roles | type: TABLE --
-- DROP TABLE IF EXISTS public.roles CASCADE;
CREATE TABLE public.roles (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	name varchar(50) NOT NULL,
	description varchar(255),
	CONSTRAINT roles_name_uq UNIQUE (name),
	CONSTRAINT roles_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.roles OWNER TO postgres;
-- ddl-end --

-- object: public.modules | type: TABLE --
-- DROP TABLE IF EXISTS public.modules CASCADE;
CREATE TABLE public.modules (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	icon varchar(50),
	name varchar(50) NOT NULL,
	path varchar(100) NOT NULL,
	CONSTRAINT modules_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.modules OWNER TO postgres;
-- ddl-end --

-- object: public.roles_modules | type: TABLE --
-- DROP TABLE IF EXISTS public.roles_modules CASCADE;
CREATE TABLE public.roles_modules (
	id_roles bigint NOT NULL,
	id_modules bigint NOT NULL,
	CONSTRAINT roles_modules_pk PRIMARY KEY (id_roles,id_modules)
);
-- ddl-end --

-- object: roles_fk | type: CONSTRAINT --
-- ALTER TABLE public.roles_modules DROP CONSTRAINT IF EXISTS roles_fk CASCADE;
ALTER TABLE public.roles_modules ADD CONSTRAINT roles_fk FOREIGN KEY (id_roles)
REFERENCES public.roles (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: modules_fk | type: CONSTRAINT --
-- ALTER TABLE public.roles_modules DROP CONSTRAINT IF EXISTS modules_fk CASCADE;
ALTER TABLE public.roles_modules ADD CONSTRAINT modules_fk FOREIGN KEY (id_modules)
REFERENCES public.modules (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: public.roles_users | type: TABLE --
-- DROP TABLE IF EXISTS public.roles_users CASCADE;
CREATE TABLE public.roles_users (
	id_roles bigint NOT NULL,
	id_users bigint NOT NULL,
	CONSTRAINT roles_users_pk PRIMARY KEY (id_roles,id_users)
);
-- ddl-end --

-- object: roles_fk | type: CONSTRAINT --
-- ALTER TABLE public.roles_users DROP CONSTRAINT IF EXISTS roles_fk CASCADE;
ALTER TABLE public.roles_users ADD CONSTRAINT roles_fk FOREIGN KEY (id_roles)
REFERENCES public.roles (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: users_fk | type: CONSTRAINT --
-- ALTER TABLE public.roles_users DROP CONSTRAINT IF EXISTS users_fk CASCADE;
ALTER TABLE public.roles_users ADD CONSTRAINT users_fk FOREIGN KEY (id_users)
REFERENCES public.users (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: public.brands | type: TABLE --
-- DROP TABLE IF EXISTS public.brands CASCADE;
CREATE TABLE public.brands (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	name varchar(50) NOT NULL,
	slug varchar(50) NOT NULL,
	image_url varchar(255) NOT NULL,
	is_active boolean NOT NULL DEFAULT true,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT brands_name_uq UNIQUE (name),
	CONSTRAINT brands_slug_uq UNIQUE (slug),
	CONSTRAINT brands_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.brands OWNER TO postgres;
-- ddl-end --

-- object: public.categories | type: TABLE --
-- DROP TABLE IF EXISTS public.categories CASCADE;
CREATE TABLE public.categories (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	name text NOT NULL,
	slug text NOT NULL,
	description varchar(255),
	parent_id bigint,
	is_active boolean NOT NULL DEFAULT true,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT categories_slug_uq UNIQUE (slug),
	CONSTRAINT categories_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.categories OWNER TO postgres;
-- ddl-end --

-- object: public.products | type: TABLE --
-- DROP TABLE IF EXISTS public.products CASCADE;
CREATE TABLE public.products (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
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
-- ddl-end --
ALTER TABLE public.products OWNER TO postgres;
-- ddl-end --

-- object: public.variants | type: TABLE --
-- DROP TABLE IF EXISTS public.variants CASCADE;
CREATE TABLE public.variants (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	product_id bigint NOT NULL,
	sku varchar(50) NOT NULL,
	price numeric(12,2) NOT NULL,
	attributes jsonb NOT NULL DEFAULT '{}',
	is_active boolean NOT NULL DEFAULT true,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT variants_pk PRIMARY KEY (id),
	CONSTRAINT variants_sku_uq UNIQUE (sku)
);
-- ddl-end --
ALTER TABLE public.variants OWNER TO postgres;
-- ddl-end --

-- object: idx_products_spec | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_products_spec CASCADE;
CREATE INDEX idx_products_spec ON public.products
USING gin
(
	specs
);
-- ddl-end --

-- object: idx_variants_attributes | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_variants_attributes CASCADE;
CREATE INDEX idx_variants_attributes ON public.variants
USING gin
(
	attributes
);
-- ddl-end --

-- object: public.images | type: TABLE --
-- DROP TABLE IF EXISTS public.images CASCADE;
CREATE TABLE public.images (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	image_url varchar(255) NOT NULL,
	product_id bigint NOT NULL,
	variant_id bigint,
	is_primary boolean NOT NULL DEFAULT false,
	display_order integer NOT NULL DEFAULT 0,
	CONSTRAINT images_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.images OWNER TO postgres;
-- ddl-end --

-- object: public.ubigeos | type: TABLE --
-- DROP TABLE IF EXISTS public.ubigeos CASCADE;
CREATE TABLE public.ubigeos (
	id varchar(6) NOT NULL,
	department_name varchar(50) NOT NULL,
	province_name varchar(50) NOT NULL,
	district_name varchar(50) NOT NULL,
	department_id varchar(2) GENERATED ALWAYS AS (SUBSTRING(id,1,2)) STORED,
	province_id varchar(4) GENERATED ALWAYS AS (SUBSTRING(id,1,4)) STORED,
	CONSTRAINT ubigeos_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.ubigeos OWNER TO postgres;
-- ddl-end --

-- object: idx_locations_province | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_locations_province CASCADE;
CREATE INDEX idx_locations_province ON public.ubigeos
USING btree
(
	province_id
);
-- ddl-end --

-- object: idx_locations_department | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_locations_department CASCADE;
CREATE INDEX idx_locations_department ON public.ubigeos
USING btree
(
	department_id
);
-- ddl-end --

-- object: public.warehouses | type: TABLE --
-- DROP TABLE IF EXISTS public.warehouses CASCADE;
CREATE TABLE public.warehouses (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	code varchar(50) NOT NULL,
	name varchar(100) NOT NULL,
	ubigeo_id varchar(6) NOT NULL,
	address varchar(255) NOT NULL,
	is_active boolean NOT NULL DEFAULT true,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT warehouses_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.warehouses OWNER TO postgres;
-- ddl-end --

-- object: public.stocks | type: TABLE --
-- DROP TABLE IF EXISTS public.stocks CASCADE;
CREATE TABLE public.stocks (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	warehouse_id bigint NOT NULL,
	variant_id bigint NOT NULL,
	quantity integer NOT NULL DEFAULT 0,
	reserved_quantity integer NOT NULL DEFAULT 0,
	updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT stock_pk PRIMARY KEY (id),
	CONSTRAINT stocks_warehouse_variant_uq UNIQUE (warehouse_id,variant_id),
	CONSTRAINT check_quantity_positive CHECK (quantity >= 0),
	CONSTRAINT check_reserved_positive CHECK (reserved_quantity >= 0)
);
-- ddl-end --
ALTER TABLE public.stocks OWNER TO postgres;
-- ddl-end --

-- object: idx_stocks_variant | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_stocks_variant CASCADE;
CREATE INDEX idx_stocks_variant ON public.stocks
USING btree
(
	variant_id
);
-- ddl-end --

-- object: idx_stocks_warehouse | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_stocks_warehouse CASCADE;
CREATE INDEX idx_stocks_warehouse ON public.stocks
USING btree
(
	warehouse_id
);
-- ddl-end --

-- object: public.operation_type_enum | type: TYPE --
-- DROP TYPE IF EXISTS public.operation_type_enum CASCADE;
CREATE TYPE public.operation_type_enum AS
ENUM ('INVENTORY_ADJUSTMENT','PURCHASE','SALE','RETURN','CANCELLATION','TRANSFER_IN','TRANSFER_OUT');
-- ddl-end --
ALTER TYPE public.operation_type_enum OWNER TO postgres;
-- ddl-end --

-- object: public.movements | type: TABLE --
-- DROP TABLE IF EXISTS public.movements CASCADE;
CREATE TABLE public.movements (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	variant_id bigint NOT NULL,
	warehouse_id bigint NOT NULL,
	quantity integer NOT NULL,
	balance integer NOT NULL,
	unit_cost numeric(12,2),
	operation_type public.operation_type_enum NOT NULL,
	description text,
	reference_id bigint NOT NULL,
	reference_table varchar(50) NOT NULL,
	user_id bigint NOT NULL,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT movement_pk PRIMARY KEY (id)
);
-- ddl-end --
COMMENT ON COLUMN public.movements.quantity IS E'El cambió de la cantidad, puede ser negativa o positiva.';
-- ddl-end --
ALTER TABLE public.movements OWNER TO postgres;
-- ddl-end --

-- object: idx_movements_tables | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_movements_tables CASCADE;
CREATE INDEX idx_movements_tables ON public.movements
USING btree
(
	reference_id,
	reference_table
);
-- ddl-end --

-- object: idx_modules_date | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_modules_date CASCADE;
CREATE INDEX idx_modules_date ON public.movements
USING btree
(
	created_at
);
-- ddl-end --

-- object: idx_movements_variant_warehouse | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_movements_variant_warehouse CASCADE;
CREATE INDEX idx_movements_variant_warehouse ON public.movements
USING btree
(
	variant_id,
	warehouse_id
);
-- ddl-end --

-- object: public.customers | type: TABLE --
-- DROP TABLE IF EXISTS public.customers CASCADE;
CREATE TABLE public.customers (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	username varchar(50) NOT NULL,
	email varchar(255) NOT NULL,
	password_hash varchar(255) NOT NULL,
	doc_type public.document_type_enum NOT NULL,
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
	CONSTRAINT "customers_docNumber_uq" UNIQUE (doc_number)
);
-- ddl-end --
ALTER TABLE public.customers OWNER TO postgres;
-- ddl-end --

-- object: public.customer_addresses | type: TABLE --
-- DROP TABLE IF EXISTS public.customer_addresses CASCADE;
CREATE TABLE public.customer_addresses (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
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
-- ddl-end --
ALTER TABLE public.customer_addresses OWNER TO postgres;
-- ddl-end --

-- object: idx_customer_default_shipping_uq | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_customer_default_shipping_uq CASCADE;
CREATE UNIQUE INDEX idx_customer_default_shipping_uq ON public.customer_addresses
USING btree
(
	customer_id
)
WHERE (is_default_shipping = TRUE);
-- ddl-end --

-- object: idx_customer_default_billing_uq | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_customer_default_billing_uq CASCADE;
CREATE UNIQUE INDEX idx_customer_default_billing_uq ON public.customer_addresses
USING btree
(
	customer_id
)
WHERE (is_default_billing = TRUE);
-- ddl-end --

-- object: idx_customers_email_lowercase | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_customers_email_lowercase CASCADE;
CREATE UNIQUE INDEX idx_customers_email_lowercase ON public.customers
USING btree
(
	(LOWER(email))
);
-- ddl-end --

-- object: public.order_status_enum | type: TYPE --
-- DROP TYPE IF EXISTS public.order_status_enum CASCADE;
CREATE TYPE public.order_status_enum AS
ENUM ('PENDING','AWAIT_PAYMENT','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED');
-- ddl-end --
ALTER TYPE public.order_status_enum OWNER TO postgres;
-- ddl-end --

-- object: public.orders | type: TABLE --
-- DROP TABLE IF EXISTS public.orders CASCADE;
CREATE TABLE public.orders (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	order_number varchar(50) NOT NULL,
	customer_id bigint NOT NULL,
	status public.order_status_enum NOT NULL DEFAULT 'PENDING',
	total numeric(12,2) NOT NULL,
	shipping_address jsonb NOT NULL,
	billing_address jsonb,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT orders_pk PRIMARY KEY (id),
	CONSTRAINT "orders_orderNumber_uq" UNIQUE (order_number)
);
-- ddl-end --
ALTER TABLE public.orders OWNER TO postgres;
-- ddl-end --

-- object: public.order_items | type: TABLE --
-- DROP TABLE IF EXISTS public.order_items CASCADE;
CREATE TABLE public.order_items (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	order_id bigint NOT NULL,
	product_id bigint NOT NULL,
	variant_id bigint NOT NULL,
	sku text NOT NULL,
	product_name text NOT NULL,
	quantity integer NOT NULL,
	unit_price numeric(12,2) NOT NULL,
	total numeric(12,2) NOT NULL,
	CONSTRAINT order_items_pk PRIMARY KEY (id),
	CONSTRAINT check_quantity_positive CHECK (quantity >= 0)
);
-- ddl-end --
ALTER TABLE public.order_items OWNER TO postgres;
-- ddl-end --

-- object: public.order_status_histories | type: TABLE --
-- DROP TABLE IF EXISTS public.order_status_histories CASCADE;
CREATE TABLE public.order_status_histories (
	id integer NOT NULL GENERATED ALWAYS AS IDENTITY ,
	order_id bigint NOT NULL,
	comments text,
	status public.order_status_enum NOT NULL,
	created_by bigint NOT NULL,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT order_status_histories_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.order_status_histories OWNER TO postgres;
-- ddl-end --

-- object: idx_orders_customer | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_orders_customer CASCADE;
CREATE INDEX idx_orders_customer ON public.orders
USING btree
(
	customer_id
);
-- ddl-end --

-- object: "idx_orders_orderNumber" | type: INDEX --
-- DROP INDEX IF EXISTS public."idx_orders_orderNumber" CASCADE;
CREATE INDEX "idx_orders_orderNumber" ON public.orders
USING btree
(
	order_number
);
-- ddl-end --

-- object: "idx_orders_createdAt" | type: INDEX --
-- DROP INDEX IF EXISTS public."idx_orders_createdAt" CASCADE;
CREATE INDEX "idx_orders_createdAt" ON public.orders
USING btree
(
	created_at
);
-- ddl-end --

-- object: public.business_info | type: TABLE --
-- DROP TABLE IF EXISTS public.business_info CASCADE;
CREATE TABLE public.business_info (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
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
-- ddl-end --
ALTER TABLE public.business_info OWNER TO postgres;
-- ddl-end --

-- object: idx_business_info_ubigeo | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_business_info_ubigeo CASCADE;
CREATE INDEX idx_business_info_ubigeo ON public.business_info
USING btree
(
	ubigeo_id
);
-- ddl-end --

-- object: public.storefront_settings | type: TABLE --
-- DROP TABLE IF EXISTS public.storefront_settings CASCADE;
CREATE TABLE public.storefront_settings (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
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
	CONSTRAINT storefront_settings_single_row_check CHECK (id = 1),
	CONSTRAINT storefront_settings_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.storefront_settings OWNER TO postgres;
-- ddl-end --

-- object: public.purchase_status_enum | type: TYPE --
-- DROP TYPE IF EXISTS public.purchase_status_enum CASCADE;
CREATE TYPE public.purchase_status_enum AS
ENUM ('PENDING','RECEIVED','CANCELLED');
-- ddl-end --
ALTER TYPE public.purchase_status_enum OWNER TO postgres;
-- ddl-end --

-- object: public.suppliers | type: TABLE --
-- DROP TABLE IF EXISTS public.suppliers CASCADE;
CREATE TABLE public.suppliers (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
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
	CONSTRAINT suppliers_doc_number_uq UNIQUE (doc_number),
	CONSTRAINT suppliers_doc_type_check CHECK (doc_type IN ('DNI', 'RUC')),
	CONSTRAINT suppliers_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.suppliers OWNER TO postgres;
-- ddl-end --

-- object: public.purchases | type: TABLE --
-- DROP TABLE IF EXISTS public.purchases CASCADE;
CREATE TABLE public.purchases (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	supplier_id bigint NOT NULL,
	warehouse_id bigint NOT NULL,
	user_id bigint NOT NULL,
	status public.purchase_status_enum NOT NULL DEFAULT 'PENDING',
	invoice_type varchar(20) NOT NULL,
	invoice_number varchar(50) NOT NULL,
	total_amount numeric(12,2) NOT NULL DEFAULT 0,
	purchase_date date NOT NULL DEFAULT CURRENT_DATE,
	notes text,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT purchases_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.purchases OWNER TO postgres;
-- ddl-end --

-- object: public.purchase_items | type: TABLE --
-- DROP TABLE IF EXISTS public.purchase_items CASCADE;
CREATE TABLE public.purchase_items (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	purchase_id bigint NOT NULL,
	variant_id bigint NOT NULL,
	quantity integer NOT NULL,
	unit_cost numeric(12,2) NOT NULL,
	subtotal numeric(12,2) NOT NULL,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT purchase_items_quantity_check CHECK (quantity > 0),
	CONSTRAINT purchase_items_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.purchase_items OWNER TO postgres;
-- ddl-end --

-- object: idx_purchases_supplier_id | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_purchases_supplier_id CASCADE;
CREATE INDEX idx_purchases_supplier_id ON public.purchases
USING btree
(
	supplier_id
);
-- ddl-end --

-- object: idx_purchases_warehouse_id | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_purchases_warehouse_id CASCADE;
CREATE INDEX idx_purchases_warehouse_id ON public.purchases
USING btree
(
	warehouse_id
);
-- ddl-end --

-- object: idx_purchase_items_variant_id | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_purchase_items_variant_id CASCADE;
CREATE INDEX idx_purchase_items_variant_id ON public.purchase_items
USING btree
(
	variant_id
);
-- ddl-end --

-- object: public.shipping_methods | type: TABLE --
-- DROP TABLE IF EXISTS public.shipping_methods CASCADE;
CREATE TABLE public.shipping_methods (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	name varchar(100) NOT NULL,
	description text NOT NULL,
	carrier varchar(100) NOT NULL,
	estimated_days_min integer NOT NULL,
	estimated_days_max integer NOT NULL,
	base_cost numeric(12,2) NOT NULL,
	cost_per_kg numeric(12,2) NOT NULL,
	is_active boolean NOT NULL DEFAULT true,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT shipping_methods_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.shipping_methods OWNER TO postgres;
-- ddl-end --

-- object: public.shipments | type: TABLE --
-- DROP TABLE IF EXISTS public.shipments CASCADE;
CREATE TABLE public.shipments (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	shipment_type varchar(10) NOT NULL,
	order_id bigint NOT NULL,
	rma_id bigint NOT NULL,
	shipping_method_id bigint NOT NULL,
	tracking_number varchar(100) NOT NULL,
	shipping_cost numeric(12,2) NOT NULL,
	weight_kg numeric(8,2) NOT NULL,
	status varchar(20) NOT NULL DEFAULT PENDING,
	estimated_delivery_date timestamptz NOT NULL,
	shipping_address jsonb NOT NULL,
	recipient_name varchar(200) NOT NULL,
	recipient_phone varchar(20) NOT NULL,
	require_signature boolean NOT NULL DEFAULT false,
	package_quantity integer NOT NULL DEFAULT 1,
	notes text NOT NULL,
	shipped_at timestamptz NOT NULL,
	delivered_at timestamptz NOT NULL,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT shipments_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.shipments OWNER TO postgres;
-- ddl-end --

-- object: public.tracking_events | type: TABLE --
-- DROP TABLE IF EXISTS public.tracking_events CASCADE;
CREATE TABLE public.tracking_events (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
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
-- ddl-end --
ALTER TABLE public.tracking_events OWNER TO postgres;
-- ddl-end --

-- object: idx_shipments_order | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_shipments_order CASCADE;
CREATE INDEX idx_shipments_order ON public.shipments
USING btree
(
	order_id
);
-- ddl-end --

-- object: idx_shipments_rma | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_shipments_rma CASCADE;
CREATE INDEX idx_shipments_rma ON public.shipments
USING btree
(
	rma_id
);
-- ddl-end --

-- object: idx_shipments_shipping_method | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_shipments_shipping_method CASCADE;
CREATE INDEX idx_shipments_shipping_method ON public.shipments
USING btree
(
	shipping_method_id
);
-- ddl-end --

-- object: idx_shipments_shipment_type | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_shipments_shipment_type CASCADE;
CREATE INDEX idx_shipments_shipment_type ON public.shipments
USING btree
(
	shipment_type
);
-- ddl-end --

-- object: idx_shipments_status | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_shipments_status CASCADE;
CREATE INDEX idx_shipments_status ON public.shipments
USING btree
(
	status
);
-- ddl-end --

-- object: idx_shipments_tracking_number | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_shipments_tracking_number CASCADE;
CREATE INDEX idx_shipments_tracking_number ON public.shipments
USING btree
(
	tracking_number
);
-- ddl-end --

-- object: idx_shipments_type_order | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_shipments_type_order CASCADE;
CREATE INDEX idx_shipments_type_order ON public.shipments
USING btree
(
	shipment_type,
	order_id
);
-- ddl-end --

-- object: idx_tracking_events_shipment | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_tracking_events_shipment CASCADE;
CREATE INDEX idx_tracking_events_shipment ON public.tracking_events
USING btree
(
	shipment_id
);
-- ddl-end --

-- object: idx_tracking_events_created_b | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_tracking_events_created_b CASCADE;
CREATE INDEX idx_tracking_events_created_b ON public.tracking_events
USING btree
(
	created_by
);
-- ddl-end --

-- object: idx_tracking_events_event_date | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_tracking_events_event_date CASCADE;
CREATE INDEX idx_tracking_events_event_date ON public.tracking_events
USING btree
(
	event_date DESC NULLS LAST
);
-- ddl-end --

-- object: idx_tracking_events_is_public | type: INDEX --
-- DROP INDEX IF EXISTS public.idx_tracking_events_is_public CASCADE;
CREATE INDEX idx_tracking_events_is_public ON public.tracking_events
USING btree
(
	is_public
);
-- ddl-end --

-- object: "categories_parentId_fk" | type: CONSTRAINT --
-- ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS "categories_parentId_fk" CASCADE;
ALTER TABLE public.categories ADD CONSTRAINT "categories_parentId_fk" FOREIGN KEY (parent_id)
REFERENCES public.categories (id) MATCH SIMPLE
ON DELETE SET NULL ON UPDATE NO ACTION;
-- ddl-end --

-- object: products_brand_fk | type: CONSTRAINT --
-- ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_brand_fk CASCADE;
ALTER TABLE public.products ADD CONSTRAINT products_brand_fk FOREIGN KEY (brand_id)
REFERENCES public.brands (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: products_category_fk | type: CONSTRAINT --
-- ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_fk CASCADE;
ALTER TABLE public.products ADD CONSTRAINT products_category_fk FOREIGN KEY (category_id)
REFERENCES public.categories (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: variants_product_fk | type: CONSTRAINT --
-- ALTER TABLE public.variants DROP CONSTRAINT IF EXISTS variants_product_fk CASCADE;
ALTER TABLE public.variants ADD CONSTRAINT variants_product_fk FOREIGN KEY (product_id)
REFERENCES public.products (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: images_product_fk | type: CONSTRAINT --
-- ALTER TABLE public.images DROP CONSTRAINT IF EXISTS images_product_fk CASCADE;
ALTER TABLE public.images ADD CONSTRAINT images_product_fk FOREIGN KEY (product_id)
REFERENCES public.products (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: images_variant_fk | type: CONSTRAINT --
-- ALTER TABLE public.images DROP CONSTRAINT IF EXISTS images_variant_fk CASCADE;
ALTER TABLE public.images ADD CONSTRAINT images_variant_fk FOREIGN KEY (variant_id)
REFERENCES public.variants (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: warehouses_ubigeo_fk | type: CONSTRAINT --
-- ALTER TABLE public.warehouses DROP CONSTRAINT IF EXISTS warehouses_ubigeo_fk CASCADE;
ALTER TABLE public.warehouses ADD CONSTRAINT warehouses_ubigeo_fk FOREIGN KEY (ubigeo_id)
REFERENCES public.ubigeos (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: stocks_warehouse_fk | type: CONSTRAINT --
-- ALTER TABLE public.stocks DROP CONSTRAINT IF EXISTS stocks_warehouse_fk CASCADE;
ALTER TABLE public.stocks ADD CONSTRAINT stocks_warehouse_fk FOREIGN KEY (warehouse_id)
REFERENCES public.warehouses (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: stocks_variant_fk | type: CONSTRAINT --
-- ALTER TABLE public.stocks DROP CONSTRAINT IF EXISTS stocks_variant_fk CASCADE;
ALTER TABLE public.stocks ADD CONSTRAINT stocks_variant_fk FOREIGN KEY (variant_id)
REFERENCES public.variants (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: movements_warehouse_fk | type: CONSTRAINT --
-- ALTER TABLE public.movements DROP CONSTRAINT IF EXISTS movements_warehouse_fk CASCADE;
ALTER TABLE public.movements ADD CONSTRAINT movements_warehouse_fk FOREIGN KEY (warehouse_id)
REFERENCES public.warehouses (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: movements_variant_fk | type: CONSTRAINT --
-- ALTER TABLE public.movements DROP CONSTRAINT IF EXISTS movements_variant_fk CASCADE;
ALTER TABLE public.movements ADD CONSTRAINT movements_variant_fk FOREIGN KEY (variant_id)
REFERENCES public.variants (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: movements_user_fk | type: CONSTRAINT --
-- ALTER TABLE public.movements DROP CONSTRAINT IF EXISTS movements_user_fk CASCADE;
ALTER TABLE public.movements ADD CONSTRAINT movements_user_fk FOREIGN KEY (user_id)
REFERENCES public.users (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: customer_addresses_ubigeo_fk | type: CONSTRAINT --
-- ALTER TABLE public.customer_addresses DROP CONSTRAINT IF EXISTS customer_addresses_ubigeo_fk CASCADE;
ALTER TABLE public.customer_addresses ADD CONSTRAINT customer_addresses_ubigeo_fk FOREIGN KEY (ubigeo_id)
REFERENCES public.ubigeos (id) MATCH SIMPLE
ON DELETE NO ACTION ON UPDATE CASCADE;
-- ddl-end --

-- object: customer_addresses_customer_fk | type: CONSTRAINT --
-- ALTER TABLE public.customer_addresses DROP CONSTRAINT IF EXISTS customer_addresses_customer_fk CASCADE;
ALTER TABLE public.customer_addresses ADD CONSTRAINT customer_addresses_customer_fk FOREIGN KEY (customer_id)
REFERENCES public.customers (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: orders_customer_fk | type: CONSTRAINT --
-- ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_customer_fk CASCADE;
ALTER TABLE public.orders ADD CONSTRAINT orders_customer_fk FOREIGN KEY (customer_id)
REFERENCES public.customers (id) MATCH SIMPLE
ON DELETE NO ACTION ON UPDATE CASCADE;
-- ddl-end --

-- object: order_items_order_fk | type: CONSTRAINT --
-- ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_order_fk CASCADE;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_order_fk FOREIGN KEY (order_id)
REFERENCES public.orders (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: order_items_product_fk | type: CONSTRAINT --
-- ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_fk CASCADE;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_fk FOREIGN KEY (product_id)
REFERENCES public.products (id) MATCH SIMPLE
ON DELETE NO ACTION ON UPDATE CASCADE;
-- ddl-end --

-- object: order_items_variant_fk | type: CONSTRAINT --
-- ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_variant_fk CASCADE;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_variant_fk FOREIGN KEY (variant_id)
REFERENCES public.variants (id) MATCH SIMPLE
ON DELETE NO ACTION ON UPDATE CASCADE;
-- ddl-end --

-- object: order_status_histories_orders_fk | type: CONSTRAINT --
-- ALTER TABLE public.order_status_histories DROP CONSTRAINT IF EXISTS order_status_histories_orders_fk CASCADE;
ALTER TABLE public.order_status_histories ADD CONSTRAINT order_status_histories_orders_fk FOREIGN KEY (order_id)
REFERENCES public.orders (id) MATCH SIMPLE
ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ddl-end --

-- object: orders_user_fk | type: CONSTRAINT --
-- ALTER TABLE public.order_status_histories DROP CONSTRAINT IF EXISTS orders_user_fk CASCADE;
ALTER TABLE public.order_status_histories ADD CONSTRAINT orders_user_fk FOREIGN KEY (created_by)
REFERENCES public.users (id) MATCH SIMPLE
ON DELETE NO ACTION ON UPDATE CASCADE;
-- ddl-end --

-- object: business_info_ubigeo_fk | type: CONSTRAINT --
-- ALTER TABLE public.business_info DROP CONSTRAINT IF EXISTS business_info_ubigeo_fk CASCADE;
ALTER TABLE public.business_info ADD CONSTRAINT business_info_ubigeo_fk FOREIGN KEY (ubigeo_id)
REFERENCES public.ubigeos (id) MATCH SIMPLE
ON DELETE NO ACTION ON UPDATE CASCADE;
-- ddl-end --

-- object: suppliers_ubigeo_fk | type: CONSTRAINT --
-- ALTER TABLE public.suppliers DROP CONSTRAINT IF EXISTS suppliers_ubigeo_fk CASCADE;
ALTER TABLE public.suppliers ADD CONSTRAINT suppliers_ubigeo_fk FOREIGN KEY (ubigeo_id)
REFERENCES public.ubigeos (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: purchases_supplier_fk | type: CONSTRAINT --
-- ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_supplier_fk CASCADE;
ALTER TABLE public.purchases ADD CONSTRAINT purchases_supplier_fk FOREIGN KEY (supplier_id)
REFERENCES public.suppliers (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: purchases_warehouse_fk | type: CONSTRAINT --
-- ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_warehouse_fk CASCADE;
ALTER TABLE public.purchases ADD CONSTRAINT purchases_warehouse_fk FOREIGN KEY (warehouse_id)
REFERENCES public.warehouses (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: purchases_user_fk | type: CONSTRAINT --
-- ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_user_fk CASCADE;
ALTER TABLE public.purchases ADD CONSTRAINT purchases_user_fk FOREIGN KEY (user_id)
REFERENCES public.users (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: purchase_items_purchase_fk | type: CONSTRAINT --
-- ALTER TABLE public.purchase_items DROP CONSTRAINT IF EXISTS purchase_items_purchase_fk CASCADE;
ALTER TABLE public.purchase_items ADD CONSTRAINT purchase_items_purchase_fk FOREIGN KEY (purchase_id)
REFERENCES public.purchases (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: purchase_items_variant_fk | type: CONSTRAINT --
-- ALTER TABLE public.purchase_items DROP CONSTRAINT IF EXISTS purchase_items_variant_fk CASCADE;
ALTER TABLE public.purchase_items ADD CONSTRAINT purchase_items_variant_fk FOREIGN KEY (variant_id)
REFERENCES public.variants (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: shipments_order_fk | type: CONSTRAINT --
-- ALTER TABLE public.shipments DROP CONSTRAINT IF EXISTS shipments_order_fk CASCADE;
ALTER TABLE public.shipments ADD CONSTRAINT shipments_order_fk FOREIGN KEY (order_id)
REFERENCES public.orders (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: shipments_shipping_method_fk | type: CONSTRAINT --
-- ALTER TABLE public.shipments DROP CONSTRAINT IF EXISTS shipments_shipping_method_fk CASCADE;
ALTER TABLE public.shipments ADD CONSTRAINT shipments_shipping_method_fk FOREIGN KEY (shipping_method_id)
REFERENCES public.shipping_methods (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: tracking_events_shipment_fk | type: CONSTRAINT --
-- ALTER TABLE public.tracking_events DROP CONSTRAINT IF EXISTS tracking_events_shipment_fk CASCADE;
ALTER TABLE public.tracking_events ADD CONSTRAINT tracking_events_shipment_fk FOREIGN KEY (shipment_id)
REFERENCES public.shipments (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: tracking_events_created_by_fk | type: CONSTRAINT --
-- ALTER TABLE public.tracking_events DROP CONSTRAINT IF EXISTS tracking_events_created_by_fk CASCADE;
ALTER TABLE public.tracking_events ADD CONSTRAINT tracking_events_created_by_fk FOREIGN KEY (created_by)
REFERENCES public.users (id) MATCH SIMPLE
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --


