-- Allow CREDIT_NOTE as a valid invoice_type for invoices

ALTER TABLE invoices
  DROP CONSTRAINT IF EXISTS invoices_invoice_type_check;

ALTER TABLE invoices
  ADD CONSTRAINT invoices_invoice_type_check
  CHECK (invoice_type IN ('BILL', 'INVOICE', 'CREDIT_NOTE'));
