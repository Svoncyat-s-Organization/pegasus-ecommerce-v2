-- Seed de módulos del sistema (basados en el sidebar)
-- Los módulos son de SOLO LECTURA, representan las secciones del backoffice

-- Limpiar datos existentes para idempotencia
DELETE FROM modules WHERE path LIKE '/admin/%';

-- Insertar módulos del sistema
INSERT INTO modules (icon, name, path) VALUES
-- Dashboard
('IconDashboard', 'Dashboard', '/admin/dashboard'),

-- Catálogo
('IconShoppingCart', 'Productos', '/admin/catalog/products'),
('IconShoppingCart', 'Categorías', '/admin/catalog/categories'),
('IconShoppingCart', 'Marcas', '/admin/catalog/brands'),

-- Pedidos
('IconShoppingBag', 'Pedidos', '/admin/orders'),

-- Inventario
('IconPackage', 'Stock', '/admin/inventory/stock'),
('IconPackage', 'Movimientos de Inventario', '/admin/inventory/movements'),
('IconPackage', 'Almacenes', '/admin/inventory/warehouses'),

-- Compras
('IconFileInvoice', 'Proveedores', '/admin/purchases/suppliers'),
('IconFileInvoice', 'Órdenes de Compra', '/admin/purchases/orders'),

-- Logística
('IconTruck', 'Envíos', '/admin/logistics/shipments'),
('IconTruck', 'Transportistas', '/admin/logistics/carriers'),

-- Facturación
('IconFileText', 'Facturación', '/admin/invoices'),

-- Devoluciones (RMA)
('IconRotate', 'Devoluciones', '/admin/rma'),

-- Clientes
('IconUsers', 'Clientes', '/admin/customers'),

-- Seguridad
('IconShield', 'Usuarios', '/admin/security/users'),
('IconShield', 'Roles y Permisos', '/admin/security/roles'),

-- Reportes
('IconFileText', 'Reportes', '/admin/reports'),

-- Configuración
('IconSettings', 'Configuración', '/admin/settings');
