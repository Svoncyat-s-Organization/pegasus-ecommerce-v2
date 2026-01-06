-- ============================================
-- Seed: Billing Configuration
-- Tables: payment_methods, document_series
-- Note: Catalog/config data only, NOT invoices or payments
-- ============================================

-- Payment Methods (catalog)
DELETE FROM payment_methods;

INSERT INTO payment_methods (name, is_active) VALUES
('Efectivo', true),
('Tarjeta de Crédito', true),
('Tarjeta de Débito', true),
('Transferencia Bancaria', true),
('Yape', true),
('Plin', true),
('PayPal', true),
('MercadoPago', false);

-- Document Series (billing configuration)
DELETE FROM document_series;

INSERT INTO document_series (document_type, series, current_number, is_active) VALUES
-- Boletas (for consumers with DNI)
('BILL', 'B001', 0, true),
('BILL', 'B002', 0, false),

-- Facturas (for businesses with RUC)  
('INVOICE', 'F001', 0, true),
('INVOICE', 'F002', 0, false),

-- Notas de Crédito
('CREDIT_NOTE', 'BC01', 0, true),
('CREDIT_NOTE', 'FC01', 0, true);
