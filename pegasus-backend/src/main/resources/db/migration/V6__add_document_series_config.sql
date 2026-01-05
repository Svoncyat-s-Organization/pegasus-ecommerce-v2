-- Only the project lead should create migrations. Team members: propose changes in PR descriptions with SQL suggestions.

-- Add document series configuration for billing documents

CREATE TABLE public.document_series (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    document_type varchar(20) NOT NULL, -- 'BILL', 'INVOICE', 'CREDIT_NOTE'
    series varchar(4) NOT NULL,         -- e.g., 'F001', 'B001'
    current_number integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT document_series_pk PRIMARY KEY (id),
    CONSTRAINT document_series_uq UNIQUE (document_type, series),
    CONSTRAINT document_series_type_check CHECK (document_type IN ('BILL', 'INVOICE', 'CREDIT_NOTE'))
);

-- Link invoices to series configuration (optional, manual series/number still supported)
ALTER TABLE public.invoices
ADD COLUMN series_id bigint;

ALTER TABLE public.invoices
ADD CONSTRAINT invoices_series_fk FOREIGN KEY (series_id)
REFERENCES public.document_series (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE CASCADE;
