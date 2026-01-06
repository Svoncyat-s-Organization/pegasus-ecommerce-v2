-- ============================================
-- Module: BILLING
-- Tables: payment_methods, document_series, invoices, payments
-- Dependencies: orders
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
