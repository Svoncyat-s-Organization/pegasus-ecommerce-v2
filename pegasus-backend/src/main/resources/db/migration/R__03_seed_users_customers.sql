-- ============================================
-- Seed: Users and Customers (Development only)
-- Note: Passwords are bcrypt hashed. Default: "password123"
-- ============================================

-- Clear existing dev data
DELETE FROM roles_users;
DELETE FROM users WHERE username IN ('admin', 'worker1', 'worker2');
DELETE FROM customers WHERE email LIKE '%@example.com';

-- Backoffice Users (staff)
-- Password: clave123 (bcrypt hash)
INSERT INTO users (username, email, password_hash, doc_type, doc_number, first_name, last_name, phone, is_active) VALUES
('admin', 'admin@pegasus.com', '$2a$12$H4ydi1ZIBLGlvzACtaf03OvENxxtiCELpooBFGt0UDsS/RLUbmNVi', 'DNI', '12345678', 'Admin', 'Sistema', '999888777', true),
('worker1', 'worker1@pegasus.com', '$2a$12$H4ydi1ZIBLGlvzACtaf03OvENxxtiCELpooBFGt0UDsS/RLUbmNVi', 'DNI', '87654321', 'Juan', 'Pérez', '999111222', true),
('worker2', 'worker2@pegasus.com', '$2a$12$H4ydi1ZIBLGlvzACtaf03OvENxxtiCELpooBFGt0UDsS/RLUbmNVi', 'DNI', '11223344', 'María', 'García', '999333444', true);

-- Storefront Customers
INSERT INTO customers (username, email, password_hash, doc_type, doc_number, first_name, last_name, phone, is_active) VALUES
('cliente1', 'cliente1@example.com', '$2a$12$H4ydi1ZIBLGlvzACtaf03OvENxxtiCELpooBFGt0UDsS/RLUbmNVi', 'DNI', '44556677', 'Carlos', 'López', '987654321', true),
('cliente2', 'cliente2@example.com', '$2a$12$H4ydi1ZIBLGlvzACtaf03OvENxxtiCELpooBFGt0UDsS/RLUbmNVi', 'DNI', '55667788', 'Ana', 'Martínez', '987123456', true);

-- Storefront Customer Addresses
-- Note: customer_id is resolved via email for determinism.
DELETE FROM customer_addresses
WHERE customer_id IN (
	SELECT id FROM customers WHERE email LIKE '%@example.com'
);

-- cliente1: default shipping + billing
INSERT INTO customer_addresses (customer_id, ubigeo_id, address, reference, postal_code, is_default_shipping, is_default_billing)
SELECT c.id, '150103', 'Av. La Molina 123', 'Dpto 301', '15012', true, true
FROM customers c
WHERE c.email = 'cliente1@example.com';

-- cliente1: secondary address (non-default)
INSERT INTO customer_addresses (customer_id, ubigeo_id, address, reference, postal_code, is_default_shipping, is_default_billing)
SELECT c.id, '150101', 'Jr. Huallaga 456', 'Referencia: al costado de la plaza', '15001', false, false
FROM customers c
WHERE c.email = 'cliente1@example.com';

-- cliente2: default shipping + billing
INSERT INTO customer_addresses (customer_id, ubigeo_id, address, reference, postal_code, is_default_shipping, is_default_billing)
SELECT c.id, '150104', 'Av. Pedro de Osma 789', 'Casa color blanca', '15063', true, true
FROM customers c
WHERE c.email = 'cliente2@example.com';
