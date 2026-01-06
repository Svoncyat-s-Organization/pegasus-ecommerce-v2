-- ============================================
-- Module: RMA (Return Merchandise Authorization)
-- Tables: rmas, rma_items, rma_status_histories
-- Dependencies: orders, customers, users, order_items, variants
-- Also adds: shipments.rma_id FK constraint
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

-- Add FK from shipments to rmas (deferred from V9)
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
    CONSTRAINT rma_items_quantity_check CHECK (quantity > 0),
    CONSTRAINT rma_items_refund_amount_check CHECK (refund_amount >= 0),
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
