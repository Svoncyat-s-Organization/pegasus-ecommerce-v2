-- ============================================
-- Module: ORDERS
-- Tables: orders, order_items, order_status_histories
-- Dependencies: customers, products, variants, users
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
    CONSTRAINT order_status_histories_user_fk FOREIGN KEY (created_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON DELETE SET NULL ON UPDATE CASCADE
);
COMMENT ON COLUMN public.order_status_histories.status IS 'Estado registrado en el historial';
