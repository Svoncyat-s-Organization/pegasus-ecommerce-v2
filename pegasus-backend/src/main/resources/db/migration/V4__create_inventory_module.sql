-- ============================================
-- Module: INVENTORY
-- Tables: warehouses, stocks, movements
-- Dependencies: ubigeos, users, variants
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
CREATE INDEX idx_movements_date ON public.movements USING btree (created_at);
CREATE INDEX idx_movements_variant_warehouse ON public.movements USING btree (variant_id, warehouse_id);
