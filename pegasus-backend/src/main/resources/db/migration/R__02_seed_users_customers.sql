-- Seed de usuarios de prueba (Backoffice Admin)
-- Password: admin123 (BCrypt hash)
INSERT INTO users (username, email, password_hash, doc_type, doc_number, first_name, last_name, phone, is_active)
VALUES 
('admin', 'admin@pegasus.com', '$2a$10$XQsI.cN1X.qEZVUNlF3YE.4vV4LbYBZYq0dEBv0PHM0h0hZVkPYCu', 'DNI', '12345678', 'Admin', 'Sistema', '+51987654321', true),
('trabajador1', 'worker1@pegasus.com', '$2a$10$XQsI.cN1X.qEZVUNlF3YE.4vV4LbYBZYq0dEBv0PHM0h0hZVkPYCu', 'DNI', '87654321', 'Carlos', 'Trabajador', '+51912345678', true);

-- Seed de clientes de prueba (Storefront)
-- Password: cliente123 (BCrypt hash)
INSERT INTO customers (username, email, password_hash, doc_type, doc_number, first_name, last_name, phone, is_active)
VALUES 
('cliente1', 'cliente1@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'DNI', '11223344', 'Juan', 'Pérez', '+51999888777', true),
('cliente2', 'cliente2@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CE', '55667788', 'María', 'García', '+51988776655', true);
