-- ============================================
-- Module: LOGISTICS
-- Tables: shipping_methods, shipments, tracking_events
-- Dependencies: orders, users
-- Note: shipments.rma_id FK will be added in V10 after rmas table is created
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
CREATE INDEX idx_tracking_events_created_by ON public.tracking_events USING btree (created_by);
CREATE INDEX idx_tracking_events_event_date ON public.tracking_events USING btree (event_date DESC NULLS LAST);
CREATE INDEX idx_tracking_events_is_public ON public.tracking_events USING btree (is_public);
