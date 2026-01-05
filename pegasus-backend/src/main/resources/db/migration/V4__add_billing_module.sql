-- Only the project lead should create migrations. Team members: propose changes in PR descriptions with SQL suggestions.

-- Billing module schema

-- 1. Enum for invoice status
CREATE TYPE public.invoice_status_enum AS ENUM ('ISSUED', 'CANCELLED', 'REJECTED');

-- 2. Payment Methods
-- Catalog for: 'CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'YAPE', 'PLIN', etc.
CREATE TABLE public.payment_methods (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    name varchar(50) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payment_methods_pk PRIMARY KEY (id),
    CONSTRAINT payment_methods_name_uq UNIQUE (name)
);

-- 3. Invoices (The legal document)
-- Linked to the 'orders' table from V1
CREATE TABLE public.invoices (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    order_id bigint NOT NULL,
    invoice_type varchar(20) NOT NULL, -- 'BILL' or 'INVOICE'
    series varchar(4) NOT NULL,        -- e.g., 'F001' or 'B001'
    number varchar(8) NOT NULL,        -- Correlative number
    receiver_tax_id varchar(20) NOT NULL,   -- DNI or RUC
    receiver_name varchar(150) NOT NULL,    -- Customer name or Company name
    subtotal numeric(12, 2) NOT NULL,
    tax_amount numeric(12, 2) NOT NULL,     -- IGV (18%)
    total_amount numeric(12, 2) NOT NULL,
    status public.invoice_status_enum NOT NULL DEFAULT 'ISSUED',
    issued_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT invoices_pk PRIMARY KEY (id),
    CONSTRAINT invoices_order_fk FOREIGN KEY (order_id)
        REFERENCES public.orders (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT invoices_series_number_uq UNIQUE (series, number),
    CONSTRAINT invoices_invoice_type_check CHECK (invoice_type IN ('BILL', 'INVOICE')),
    CONSTRAINT invoices_amounts_check CHECK (subtotal >= 0 AND tax_amount >= 0 AND total_amount > 0 AND total_amount = subtotal + tax_amount)
);

-- 4. Payments (The financial transaction)
CREATE TABLE public.payments (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    order_id bigint NOT NULL,
    payment_method_id bigint NOT NULL,
    amount numeric(12, 2) NOT NULL,
    transaction_id varchar(100), -- ID from payment gateway or bank operation
    payment_date timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_pk PRIMARY KEY (id),
    CONSTRAINT payments_order_fk FOREIGN KEY (order_id)
        REFERENCES public.orders (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT payments_method_fk FOREIGN KEY (payment_method_id)
        REFERENCES public.payment_methods (id) MATCH SIMPLE
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT payments_amount_check CHECK (amount > 0)
);

-- 5. Indexes for financial reporting
CREATE INDEX idx_invoices_issued_at ON public.invoices USING btree (issued_at);
CREATE INDEX idx_invoices_order_id ON public.invoices USING btree (order_id);
CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);
CREATE INDEX idx_payments_payment_method_id ON public.payments USING btree (payment_method_id);
