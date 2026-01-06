-- Add received_quantity to track partial receipts
ALTER TABLE purchase_items
ADD COLUMN received_quantity integer NOT NULL DEFAULT 0;
