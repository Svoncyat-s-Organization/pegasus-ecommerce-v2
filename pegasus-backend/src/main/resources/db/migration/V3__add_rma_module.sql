-- Only the project lead should create migrations. Team members: propose changes in PR descriptions with SQL suggestions.

-- Migration: Add RMA (Return Merchandise Authorization) Module
-- Created: 2026-01-05
-- Purpose: Implement return/refund system for customer orders
-- Related Modules: Orders, Customers, Logistics (shipments), Inventory (stock adjustments)

-- ==================== ENUMS ====================

-- object: public.rma_status_enum | type: TYPE --
-- DROP TYPE IF EXISTS public.rma_status_enum CASCADE;
CREATE TYPE public.rma_status_enum AS
ENUM ('PENDING','APPROVED','REJECTED','IN_TRANSIT','RECEIVED','INSPECTING','REFUNDED','CLOSED','CANCELLED');
-- ddl-end --
ALTER TYPE public.rma_status_enum OWNER TO postgres;
-- ddl-end --
COMMENT ON TYPE public.rma_status_enum IS 'RMA lifecycle states: PENDING (customer requested), APPROVED (approved by staff), REJECTED (denied), IN_TRANSIT (customer shipped back), RECEIVED (warehouse received), INSPECTING (staff inspecting), REFUNDED (money returned), CLOSED (completed), CANCELLED (customer cancelled)';
-- ddl-end --

-- object: public.rma_reason_enum | type: TYPE --
-- DROP TYPE IF EXISTS public.rma_reason_enum CASCADE;
CREATE TYPE public.rma_reason_enum AS
ENUM ('DEFECTIVE','WRONG_ITEM','NOT_AS_DESCRIBED','DAMAGED_SHIPPING','CHANGED_MIND','SIZE_COLOR','LATE_DELIVERY','OTHER');
-- ddl-end --
ALTER TYPE public.rma_reason_enum OWNER TO postgres;
-- ddl-end --
COMMENT ON TYPE public.rma_reason_enum IS 'Return reasons: DEFECTIVE (product broken), WRONG_ITEM (wrong product sent), NOT_AS_DESCRIBED (does not match description), DAMAGED_SHIPPING (damaged during delivery), CHANGED_MIND (customer regret), SIZE_COLOR (wrong size/color), LATE_DELIVERY (arrived too late), OTHER (custom reason)';
-- ddl-end --

-- object: public.item_condition_enum | type: TYPE --
-- DROP TYPE IF EXISTS public.item_condition_enum CASCADE;
CREATE TYPE public.item_condition_enum AS
ENUM ('UNOPENED','OPENED_UNUSED','USED_LIKE_NEW','USED_GOOD','DAMAGED','DEFECTIVE');
-- ddl-end --
ALTER TYPE public.item_condition_enum OWNER TO postgres;
-- ddl-end --
COMMENT ON TYPE public.item_condition_enum IS 'Condition of returned item upon inspection: UNOPENED (sealed), OPENED_UNUSED (opened but not used), USED_LIKE_NEW (minimal use), USED_GOOD (normal wear), DAMAGED (physical damage), DEFECTIVE (not working)';
-- ddl-end --

-- object: public.refund_method_enum | type: TYPE --
-- DROP TYPE IF EXISTS public.refund_method_enum CASCADE;
CREATE TYPE public.refund_method_enum AS
ENUM ('ORIGINAL_PAYMENT','BANK_TRANSFER','STORE_CREDIT','EXCHANGE');
-- ddl-end --
ALTER TYPE public.refund_method_enum OWNER TO postgres;
-- ddl-end --
COMMENT ON TYPE public.refund_method_enum IS 'How the refund will be processed: ORIGINAL_PAYMENT (same payment method), BANK_TRANSFER (bank account), STORE_CREDIT (credit for future purchases), EXCHANGE (product exchange)';
-- ddl-end --

-- ==================== MAIN TABLES ====================

-- object: public.rmas | type: TABLE --
-- DROP TABLE IF EXISTS public.rmas CASCADE;
CREATE TABLE public.rmas (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
	rma_number varchar(50) NOT NULL,
	order_id bigint NOT NULL,
	customer_id bigint NOT NULL,
	status public.rma_status_enum NOT NULL DEFAULT 'PENDING',
	reason public.rma_reason_enum NOT NULL,
	customer_comments text,
	staff_notes text,
	refund_method public.refund_method_enum,
	refund_amount numeric(12,2),
	restocking_fee numeric(12,2) NOT NULL DEFAULT 0,
	shipping_cost_refund numeric(12,2) NOT NULL DEFAULT 0,
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
	CONSTRAINT check_shipping_cost_refund_positive CHECK (shipping_cost_refund >= 0)
);
-- ddl-end --
ALTER TABLE public.rmas OWNER TO postgres;
-- ddl-end --
COMMENT ON TABLE public.rmas IS 'Main RMA (Return Merchandise Authorization) records. Each RMA represents a customer request to return items from an order.';
-- ddl-end --
COMMENT ON COLUMN public.rmas.rma_number IS 'Unique RMA identifier for customer reference (e.g., RMA-2026-00001)';
-- ddl-end --
COMMENT ON COLUMN public.rmas.restocking_fee IS 'Fee charged for restocking returned items (typically for non-defective returns)';
-- ddl-end --
COMMENT ON COLUMN public.rmas.shipping_cost_refund IS 'Amount of original shipping cost to refund (usually 0 unless company fault)';
-- ddl-end --
COMMENT ON COLUMN public.rmas.refund_amount IS 'Total amount to refund = (sum of rma_items.refund_amount) - restocking_fee + shipping_cost_refund';
-- ddl-end --

-- object: public.rma_items | type: TABLE --
-- DROP TABLE IF EXISTS public.rma_items CASCADE;
CREATE TABLE public.rma_items (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
	rma_id bigint NOT NULL,
	order_item_id bigint NOT NULL,
	variant_id bigint NOT NULL,
	quantity integer NOT NULL,
	item_condition public.item_condition_enum,
	inspection_notes text,
	refund_amount numeric(12,2) NOT NULL,
	restock_approved boolean NOT NULL DEFAULT false,
	inspected_by bigint,
	inspected_at timestamptz,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT rma_items_pk PRIMARY KEY (id),
	CONSTRAINT check_quantity_positive CHECK (quantity > 0),
	CONSTRAINT check_refund_amount_positive CHECK (refund_amount >= 0)
);
-- ddl-end --
ALTER TABLE public.rma_items OWNER TO postgres;
-- ddl-end --
COMMENT ON TABLE public.rma_items IS 'Individual items being returned in an RMA. Links to original order_items and variants for tracking.';
-- ddl-end --
COMMENT ON COLUMN public.rma_items.item_condition IS 'Condition assessed during inspection (NULL until inspection happens)';
-- ddl-end --
COMMENT ON COLUMN public.rma_items.refund_amount IS 'Amount to refund for this item (quantity * unit_price or adjusted based on condition)';
-- ddl-end --
COMMENT ON COLUMN public.rma_items.restock_approved IS 'Whether the item can be restocked for resale (based on condition)';
-- ddl-end --

-- object: public.rma_status_histories | type: TABLE --
-- DROP TABLE IF EXISTS public.rma_status_histories CASCADE;
CREATE TABLE public.rma_status_histories (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
	rma_id bigint NOT NULL,
	status public.rma_status_enum NOT NULL,
	comments text,
	created_by bigint NOT NULL,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT rma_status_histories_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.rma_status_histories OWNER TO postgres;
-- ddl-end --
COMMENT ON TABLE public.rma_status_histories IS 'Audit trail of RMA status changes. Tracks who changed status and when.';
-- ddl-end --

-- ==================== INDEXES ====================

-- object: idx_rmas_order | type: INDEX --
CREATE INDEX idx_rmas_order ON public.rmas
USING btree (order_id);
-- ddl-end --

-- object: idx_rmas_customer | type: INDEX --
CREATE INDEX idx_rmas_customer ON public.rmas
USING btree (customer_id);
-- ddl-end --

-- object: idx_rmas_status | type: INDEX --
CREATE INDEX idx_rmas_status ON public.rmas
USING btree (status);
-- ddl-end --

-- object: idx_rmas_rma_number | type: INDEX --
CREATE INDEX idx_rmas_rma_number ON public.rmas
USING btree (rma_number);
-- ddl-end --

-- object: idx_rmas_created_at | type: INDEX --
CREATE INDEX idx_rmas_created_at ON public.rmas
USING btree (created_at DESC);
-- ddl-end --

-- object: idx_rmas_approved_by | type: INDEX --
CREATE INDEX idx_rmas_approved_by ON public.rmas
USING btree (approved_by);
-- ddl-end --

-- object: idx_rma_items_rma | type: INDEX --
CREATE INDEX idx_rma_items_rma ON public.rma_items
USING btree (rma_id);
-- ddl-end --

-- object: idx_rma_items_order_item | type: INDEX --
CREATE INDEX idx_rma_items_order_item ON public.rma_items
USING btree (order_item_id);
-- ddl-end --

-- object: idx_rma_items_variant | type: INDEX --
CREATE INDEX idx_rma_items_variant ON public.rma_items
USING btree (variant_id);
-- ddl-end --

-- object: idx_rma_items_inspected_by | type: INDEX --
CREATE INDEX idx_rma_items_inspected_by ON public.rma_items
USING btree (inspected_by);
-- ddl-end --

-- object: idx_rma_status_histories_rma | type: INDEX --
CREATE INDEX idx_rma_status_histories_rma ON public.rma_status_histories
USING btree (rma_id);
-- ddl-end --

-- object: idx_rma_status_histories_created_by | type: INDEX --
CREATE INDEX idx_rma_status_histories_created_by ON public.rma_status_histories
USING btree (created_by);
-- ddl-end --

-- object: idx_rma_status_histories_created_at | type: INDEX --
CREATE INDEX idx_rma_status_histories_created_at ON public.rma_status_histories
USING btree (created_at DESC);
-- ddl-end --

-- ==================== FOREIGN KEY CONSTRAINTS ====================

-- object: rmas_order_fk | type: CONSTRAINT --
ALTER TABLE public.rmas ADD CONSTRAINT rmas_order_fk 
FOREIGN KEY (order_id)
REFERENCES public.orders (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: rmas_customer_fk | type: CONSTRAINT --
ALTER TABLE public.rmas ADD CONSTRAINT rmas_customer_fk 
FOREIGN KEY (customer_id)
REFERENCES public.customers (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: rmas_approved_by_fk | type: CONSTRAINT --
ALTER TABLE public.rmas ADD CONSTRAINT rmas_approved_by_fk 
FOREIGN KEY (approved_by)
REFERENCES public.users (id) MATCH SIMPLE
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: rma_items_rma_fk | type: CONSTRAINT --
ALTER TABLE public.rma_items ADD CONSTRAINT rma_items_rma_fk 
FOREIGN KEY (rma_id)
REFERENCES public.rmas (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: rma_items_order_item_fk | type: CONSTRAINT --
ALTER TABLE public.rma_items ADD CONSTRAINT rma_items_order_item_fk 
FOREIGN KEY (order_item_id)
REFERENCES public.order_items (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: rma_items_variant_fk | type: CONSTRAINT --
ALTER TABLE public.rma_items ADD CONSTRAINT rma_items_variant_fk 
FOREIGN KEY (variant_id)
REFERENCES public.variants (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: rma_items_inspected_by_fk | type: CONSTRAINT --
ALTER TABLE public.rma_items ADD CONSTRAINT rma_items_inspected_by_fk 
FOREIGN KEY (inspected_by)
REFERENCES public.users (id) MATCH SIMPLE
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: rma_status_histories_rma_fk | type: CONSTRAINT --
ALTER TABLE public.rma_status_histories ADD CONSTRAINT rma_status_histories_rma_fk 
FOREIGN KEY (rma_id)
REFERENCES public.rmas (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: rma_status_histories_created_by_fk | type: CONSTRAINT --
ALTER TABLE public.rma_status_histories ADD CONSTRAINT rma_status_histories_created_by_fk 
FOREIGN KEY (created_by)
REFERENCES public.users (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- ==================== UPDATE EXISTING TABLES ====================

-- Fix shipments.rma_id to be nullable and add FK constraint
-- This was missing in V1 migration (orphan FK reference)
ALTER TABLE public.shipments ALTER COLUMN rma_id DROP NOT NULL;
-- ddl-end --

-- object: shipments_rma_fk | type: CONSTRAINT --
ALTER TABLE public.shipments ADD CONSTRAINT shipments_rma_fk 
FOREIGN KEY (rma_id)
REFERENCES public.rmas (id) MATCH SIMPLE
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --
