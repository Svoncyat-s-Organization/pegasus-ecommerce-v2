-- Seed de roles y asignaciones de permisos
-- Define roles del sistema y asigna módulos (permisos) y usuarios

-- Limpiar datos existentes para idempotencia (orden: hijo → padre)
DELETE FROM roles_users WHERE id_roles IN (SELECT id FROM roles WHERE name IN ('Administrador', 'Vendedor'));
DELETE FROM roles_modules WHERE id_roles IN (SELECT id FROM roles WHERE name IN ('Administrador', 'Vendedor'));
DELETE FROM roles WHERE name IN ('Administrador', 'Vendedor');

-- =====================================================
-- 1. CREAR ROLES
-- =====================================================
INSERT INTO roles (name, description) VALUES
('Administrador', 'Acceso completo a todos los módulos del sistema'),
('Vendedor', 'Acceso a ventas, catálogo, clientes y pedidos');

-- =====================================================
-- 2. ASIGNAR MÓDULOS A ROLES (Permisos)
-- =====================================================

-- ROL: Administrador (acceso a TODO)
INSERT INTO roles_modules (id_roles, id_modules)
SELECT 
    (SELECT id FROM roles WHERE name = 'Administrador'),
    m.id
FROM modules m;

-- ROL: Vendedor (acceso limitado)
INSERT INTO roles_modules (id_roles, id_modules)
SELECT 
    (SELECT id FROM roles WHERE name = 'Vendedor'),
    m.id
FROM modules m
WHERE m.path IN (
    -- Dashboard
    '/admin/dashboard',
    
    -- Catálogo (consulta solamente)
    '/admin/catalog/products',
    '/admin/catalog/categories',
    '/admin/catalog/brands',
    
    -- Pedidos (gestión completa)
    '/admin/orders',
    
    -- Clientes (gestión completa)
    '/admin/customers',
    
    -- Inventario (solo consulta de stock)
    '/admin/inventory/stock',
    
    -- Reportes (consulta)
    '/admin/reports'
);

-- =====================================================
-- 3. ASIGNAR ROLES A USUARIOS
-- =====================================================

-- Usuario: admin -> Rol Administrador
INSERT INTO roles_users (id_roles, id_users)
SELECT 
    (SELECT id FROM roles WHERE name = 'Administrador'),
    (SELECT id FROM users WHERE username = 'admin');

-- Usuario: vendedor1 -> Rol Vendedor
INSERT INTO roles_users (id_roles, id_users)
SELECT 
    (SELECT id FROM roles WHERE name = 'Vendedor'),
    (SELECT id FROM users WHERE username = 'vendedor1');
