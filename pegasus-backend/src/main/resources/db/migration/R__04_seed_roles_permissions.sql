-- ============================================
-- Seed: Roles and Permissions
-- Note: Admin role has access to all modules
-- ============================================

-- Clear existing data
DELETE FROM roles_users;
DELETE FROM roles_modules;
DELETE FROM roles WHERE name IN ('Administrador', 'Vendedor', 'Almacenero', 'Contador');

-- Create roles
INSERT INTO roles (name, description) VALUES
('Administrador', 'Acceso total al sistema'),
('Vendedor', 'Gestión de pedidos y clientes'),
('Almacenero', 'Gestión de inventario y compras'),
('Contador', 'Gestión de facturación y reportes');

-- Assign ALL modules to Administrador
INSERT INTO roles_modules (id_roles, id_modules)
SELECT r.id, m.id
FROM roles r, modules m
WHERE r.name = 'Administrador';

-- Assign specific modules to Vendedor
INSERT INTO roles_modules (id_roles, id_modules)
SELECT r.id, m.id
FROM roles r, modules m
WHERE r.name = 'Vendedor'
AND m.path IN (
    '/admin/dashboard',
    '/admin/catalog/products',
    '/admin/catalog/categories',
    '/admin/catalog/brands',
    '/admin/orders',
    '/admin/customers',
    '/admin/rma'
);

-- Assign specific modules to Almacenero
INSERT INTO roles_modules (id_roles, id_modules)
SELECT r.id, m.id
FROM roles r, modules m
WHERE r.name = 'Almacenero'
AND m.path IN (
    '/admin/dashboard',
    '/admin/inventory/warehouses',
    '/admin/inventory/stock',
    '/admin/inventory/movements',
    '/admin/purchases/suppliers',
    '/admin/purchases/orders',
    '/admin/logistics/shipments',
    '/admin/logistics/shipping-methods'
);

-- Assign specific modules to Contador
INSERT INTO roles_modules (id_roles, id_modules)
SELECT r.id, m.id
FROM roles r, modules m
WHERE r.name = 'Contador'
AND m.path IN (
    '/admin/dashboard',
    '/admin/invoices/invoices',
    '/admin/invoices/payments',
    '/admin/invoices/series',
    '/admin/invoices/payment-methods',
    '/admin/reports'
);

-- Assign roles to users
-- Admin user gets Administrador role
INSERT INTO roles_users (id_roles, id_users)
SELECT r.id, u.id
FROM roles r, users u
WHERE r.name = 'Administrador' AND u.username = 'admin';

-- Worker1 gets Vendedor role
INSERT INTO roles_users (id_roles, id_users)
SELECT r.id, u.id
FROM roles r, users u
WHERE r.name = 'Vendedor' AND u.username = 'worker1';

-- Worker2 gets Almacenero role
INSERT INTO roles_users (id_roles, id_users)
SELECT r.id, u.id
FROM roles r, users u
WHERE r.name = 'Almacenero' AND u.username = 'worker2';
