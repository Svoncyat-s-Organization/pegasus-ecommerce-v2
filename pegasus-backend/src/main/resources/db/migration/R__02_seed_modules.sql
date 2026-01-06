-- ============================================
-- Seed: Modules (based on frontend sidebar)
-- Source: BackofficeSidebar.tsx
-- ============================================

DELETE FROM modules WHERE path LIKE '/admin/%';

INSERT INTO modules (icon, name, path) VALUES
-- Dashboard
('IconDashboard', 'Dashboard', '/admin/dashboard'),

-- Catalog
('IconShoppingCart', 'Categorías', '/admin/catalog/categories'),
('IconShoppingCart', 'Marcas', '/admin/catalog/brands'),
('IconShoppingCart', 'Productos', '/admin/catalog/products'),

-- Orders
('IconShoppingBag', 'Pedidos', '/admin/orders'),

-- Inventory
('IconPackage', 'Almacenes', '/admin/inventory/warehouses'),
('IconPackage', 'Existencias', '/admin/inventory/stock'),
('IconPackage', 'Movimientos', '/admin/inventory/movements'),

-- Purchases
('IconFileInvoice', 'Proveedores', '/admin/purchases/suppliers'),
('IconFileInvoice', 'Órdenes de Compra', '/admin/purchases/orders'),

-- Logistics
('IconTruck', 'Métodos de Envío', '/admin/logistics/shipping-methods'),
('IconTruck', 'Envíos', '/admin/logistics/shipments'),

-- Billing (Invoices)
('IconFileText', 'Comprobantes', '/admin/invoices/invoices'),
('IconFileText', 'Pagos', '/admin/invoices/payments'),
('IconFileText', 'Series', '/admin/invoices/series'),
('IconFileText', 'Métodos de pago', '/admin/invoices/payment-methods'),

-- RMA
('IconRotate', 'Devoluciones', '/admin/rma'),

-- Customers
('IconUsers', 'Clientes', '/admin/customers'),

-- Security
('IconShield', 'Usuarios', '/admin/security/users'),
('IconShield', 'Roles y Permisos', '/admin/security/roles'),

-- Reports
('IconFileText', 'Reportes', '/admin/reports'),

-- Settings
('IconSettings', 'Configuración', '/admin/settings');
