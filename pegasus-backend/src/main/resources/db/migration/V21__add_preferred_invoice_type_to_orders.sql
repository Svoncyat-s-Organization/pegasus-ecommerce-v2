-- ============================================
-- Migration V17: Add preferred_invoice_type to orders
-- Purpose: Store customer's invoice type preference (BILL/INVOICE)
-- ============================================

ALTER TABLE public.orders
    ADD COLUMN preferred_invoice_type varchar(20);

ALTER TABLE public.orders
    ADD CONSTRAINT orders_preferred_invoice_type_check 
    CHECK (preferred_invoice_type IN ('BILL', 'INVOICE'));

COMMENT ON COLUMN public.orders.preferred_invoice_type IS 'Tipo de comprobante preferido por el cliente: BILL (Boleta) o INVOICE (Factura)';
