-- Seed de usuarios de prueba (Backoffice Admin)
-- Password: clave123 (BCrypt hash)

-- Limpiar datos existentes para idempotencia
DELETE FROM users WHERE email IN ('admin@pegasus.com', 'worker1@pegasus.com');

INSERT INTO users (username, email, password_hash, doc_type, doc_number, first_name, last_name, phone, is_active)
VALUES 
('admin', 'admin@pegasus.com', '$2a$12$H4ydi1ZIBLGlvzACtaf03OvENxxtiCELpooBFGt0UDsS/RLUbmNVi', 'DNI', '12345678', 'Admin', 'Sistema', '987654321', true),
('trabajador1', 'worker1@pegasus.com', '$2a$12$H4ydi1ZIBLGlvzACtaf03OvENxxtiCELpooBFGt0UDsS/RLUbmNVi', 'DNI', '87654321', 'Carlos', 'Trabajador', '912345678', true);

-- Seed de clientes de prueba (Storefront)
-- Password: clave123 (BCrypt hash)

-- Limpiar datos existentes para idempotencia
DELETE FROM customers WHERE email IN ('cliente1@test.com', 'cliente2@test.com');

INSERT INTO customers (username, email, password_hash, doc_type, doc_number, first_name, last_name, phone, is_active)
VALUES 
('cliente1', 'cliente1@test.com', '$2a$12$H4ydi1ZIBLGlvzACtaf03OvENxxtiCELpooBFGt0UDsS/RLUbmNVi', 'DNI', '11223344', 'Juan', 'Pérez', '999888777', true),
('cliente2', 'cliente2@test.com', '$2a$12$H4ydi1ZIBLGlvzACtaf03OvENxxtiCELpooBFGt0UDsS/RLUbmNVi', 'CE', '55667788', 'María', 'García', '988776655', true);