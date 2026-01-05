-- ============================================
-- SEED: Inventory Module (Warehouses, Stocks, Movements)
-- Archivo: R__07_seed_inventory.sql
-- Descripción: Datos de inventario inicial para almacenes y stock de productos
-- ============================================

-- ============================================
-- LIMPIEZA DE DATOS (IDEMPOTENCIA)
-- ============================================
DELETE FROM movements;
DELETE FROM stocks;
DELETE FROM warehouses;

-- Reiniciar secuencias
ALTER SEQUENCE warehouses_id_seq RESTART WITH 1;
ALTER SEQUENCE stocks_id_seq RESTART WITH 1;
ALTER SEQUENCE movements_id_seq RESTART WITH 1;

-- ============================================
-- 1. WAREHOUSES (Almacenes)
-- ============================================

-- Almacén Principal - Lima Cercado
INSERT INTO warehouses (code, name, ubigeo_id, address, is_active, created_at, updated_at)
VALUES (
    'WH-LIM-01',
    'Almacén Principal Lima',
    '150101', -- Lima > Lima > Lima (Cercado)
    'Av. Argentina 1234, Lima Cercado',
    true,
    NOW(),
    NOW()
);

-- Almacén Secundario - San Juan de Lurigancho
INSERT INTO warehouses (code, name, ubigeo_id, address, is_active, created_at, updated_at)
VALUES (
    'WH-LIM-02',
    'Almacén SJL',
    '150132', -- Lima > Lima > San Juan de Lurigancho
    'Av. Próceres de la Independencia 5678, San Juan de Lurigancho',
    true,
    NOW(),
    NOW()
);

-- ============================================
-- 2. STOCKS (Stock inicial por variante)
-- ============================================

-- Laptops: MacBook Air M2 (2 variantes)
-- WH-LIM-01: 8 unidades, WH-LIM-02: 5 unidades
INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 8, 0, NOW()
FROM variants v WHERE v.sku = 'MBA-M2-256-MIDNIGHT';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 5, 0, NOW()
FROM variants v WHERE v.sku = 'MBA-M2-256-MIDNIGHT';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 6, 0, NOW()
FROM variants v WHERE v.sku = 'MBA-M2-512-STARLIGHT';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 4, 0, NOW()
FROM variants v WHERE v.sku = 'MBA-M2-512-STARLIGHT';

-- Laptops: Lenovo IdeaPad 5 (2 variantes)
INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 15, 0, NOW()
FROM variants v WHERE v.sku = 'IP5-GEN7-16GB-512';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 10, 0, NOW()
FROM variants v WHERE v.sku = 'IP5-GEN7-16GB-512';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 12, 0, NOW()
FROM variants v WHERE v.sku = 'IP5-GEN7-8GB-512';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 8, 0, NOW()
FROM variants v WHERE v.sku = 'IP5-GEN7-8GB-512';

-- Laptops: HP Pavilion Gaming (1 variante)
INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 10, 0, NOW()
FROM variants v WHERE v.sku = 'HP-PAV15-GTX1650-8GB';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 7, 0, NOW()
FROM variants v WHERE v.sku = 'HP-PAV15-GTX1650-8GB';

-- Laptops: Dell XPS 13 Plus (2 variantes)
INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 5, 0, NOW()
FROM variants v WHERE v.sku = 'XPS13-PLUS-512-16GB';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 3, 0, NOW()
FROM variants v WHERE v.sku = 'XPS13-PLUS-512-16GB';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 4, 0, NOW()
FROM variants v WHERE v.sku = 'XPS13-PLUS-1TB-32GB';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 2, 0, NOW()
FROM variants v WHERE v.sku = 'XPS13-PLUS-1TB-32GB';

-- Smartphones: iPhone 15 Pro Max (3 variantes)
INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 20, 0, NOW()
FROM variants v WHERE v.sku = 'IPH15PM-256-TITANIUM-NATURAL';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 15, 0, NOW()
FROM variants v WHERE v.sku = 'IPH15PM-256-TITANIUM-NATURAL';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 12, 0, NOW()
FROM variants v WHERE v.sku = 'IPH15PM-512-TITANIUM-BLACK';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 8, 0, NOW()
FROM variants v WHERE v.sku = 'IPH15PM-512-TITANIUM-BLACK';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 6, 0, NOW()
FROM variants v WHERE v.sku = 'IPH15PM-1TB-TITANIUM-BLUE';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 4, 0, NOW()
FROM variants v WHERE v.sku = 'IPH15PM-1TB-TITANIUM-BLUE';

-- Smartphones: Samsung Galaxy S24 Ultra (2 variantes)
INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 18, 0, NOW()
FROM variants v WHERE v.sku = 'S24U-512-TITANIUM-GRAY';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 12, 0, NOW()
FROM variants v WHERE v.sku = 'S24U-512-TITANIUM-GRAY';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 10, 0, NOW()
FROM variants v WHERE v.sku = 'S24U-1TB-TITANIUM-VIOLET';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 6, 0, NOW()
FROM variants v WHERE v.sku = 'S24U-1TB-TITANIUM-VIOLET';

-- Smartphones: Xiaomi 14 Pro (2 variantes)
INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 25, 0, NOW()
FROM variants v WHERE v.sku = 'XIA14P-256-BLACK';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 20, 0, NOW()
FROM variants v WHERE v.sku = 'XIA14P-256-BLACK';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 15, 0, NOW()
FROM variants v WHERE v.sku = 'XIA14P-512-WHITE';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 10, 0, NOW()
FROM variants v WHERE v.sku = 'XIA14P-512-WHITE';

-- Audio: AirPods Max (2 variantes)
INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 8, 0, NOW()
FROM variants v WHERE v.sku = 'APM-SILVER';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 5, 0, NOW()
FROM variants v WHERE v.sku = 'APM-SILVER';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 7, 0, NOW()
FROM variants v WHERE v.sku = 'APM-SPACE-GRAY';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 4, 0, NOW()
FROM variants v WHERE v.sku = 'APM-SPACE-GRAY';

-- Audio: Sony WH-1000XM5 (2 variantes)
INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 20, 0, NOW()
FROM variants v WHERE v.sku = 'XM5-BLACK';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 15, 0, NOW()
FROM variants v WHERE v.sku = 'XM5-BLACK';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 18, 0, NOW()
FROM variants v WHERE v.sku = 'XM5-SILVER';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 12, 0, NOW()
FROM variants v WHERE v.sku = 'XM5-SILVER';

-- Accesorios: Logitech G915 TKL (2 variantes)
INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 12, 0, NOW()
FROM variants v WHERE v.sku = 'G915TKL-TACTILE';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 8, 0, NOW()
FROM variants v WHERE v.sku = 'G915TKL-TACTILE';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 10, 0, NOW()
FROM variants v WHERE v.sku = 'G915TKL-LINEAR';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 7, 0, NOW()
FROM variants v WHERE v.sku = 'G915TKL-LINEAR';

-- Accesorios: Logitech G Pro X Superlight (2 variantes)
INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 15, 0, NOW()
FROM variants v WHERE v.sku = 'GPROX-SL-BLACK';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 10, 0, NOW()
FROM variants v WHERE v.sku = 'GPROX-SL-BLACK';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 1, v.id, 12, 0, NOW()
FROM variants v WHERE v.sku = 'GPROX-SL-WHITE';

INSERT INTO stocks (warehouse_id, variant_id, quantity, reserved_quantity, updated_at)
SELECT 2, v.id, 8, 0, NOW()
FROM variants v WHERE v.sku = 'GPROX-SL-WHITE';

-- ============================================
-- 3. MOVEMENTS (Movimientos de ajuste inicial)
-- ============================================
-- Estos movimientos justifican el stock inicial como "Ajuste de Inventario Inicial"
-- operation_type: INVENTORY_ADJUSTMENT
-- reference_table: 'warehouses' (referencia al almacén)
-- user_id: 1 (admin user)

-- Movimientos para Almacén Principal (WH-LIM-01)
INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 8, 8, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'MBA-M2-256-MIDNIGHT';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 6, 6, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'MBA-M2-512-STARLIGHT';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 15, 15, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'IP5-GEN7-16GB-512';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 12, 12, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'IP5-GEN7-8GB-512';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 10, 10, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'HP-PAV15-GTX1650-8GB';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 5, 5, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'XPS13-PLUS-512-16GB';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 4, 4, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'XPS13-PLUS-1TB-32GB';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 20, 20, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'IPH15PM-256-TITANIUM-NATURAL';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 12, 12, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'IPH15PM-512-TITANIUM-BLACK';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 6, 6, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'IPH15PM-1TB-TITANIUM-BLUE';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 18, 18, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'S24U-512-TITANIUM-GRAY';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 10, 10, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'S24U-1TB-TITANIUM-VIOLET';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 25, 25, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'XIA14P-256-BLACK';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 15, 15, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'XIA14P-512-WHITE';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 8, 8, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'APM-SILVER';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 7, 7, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'APM-SPACE-GRAY';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 20, 20, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'XM5-BLACK';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 18, 18, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'XM5-SILVER';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 12, 12, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'G915TKL-TACTILE';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 10, 10, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'G915TKL-LINEAR';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 15, 15, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'GPROX-SL-BLACK';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 1, 12, 12, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén Principal', 1, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'GPROX-SL-WHITE';

-- Movimientos para Almacén SJL (WH-LIM-02)
INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 5, 5, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'MBA-M2-256-MIDNIGHT';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 4, 4, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'MBA-M2-512-STARLIGHT';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 10, 10, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'IP5-GEN7-16GB-512';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 8, 8, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'IP5-GEN7-8GB-512';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 7, 7, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'HP-PAV15-GTX1650-8GB';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 3, 3, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'XPS13-PLUS-512-16GB';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 2, 2, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'XPS13-PLUS-1TB-32GB';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 15, 15, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'IPH15PM-256-TITANIUM-NATURAL';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 8, 8, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'IPH15PM-512-TITANIUM-BLACK';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 4, 4, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'IPH15PM-1TB-TITANIUM-BLUE';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 12, 12, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'S24U-512-TITANIUM-GRAY';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 6, 6, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'S24U-1TB-TITANIUM-VIOLET';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 20, 20, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'XIA14P-256-BLACK';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 10, 10, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'XIA14P-512-WHITE';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 5, 5, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'APM-SILVER';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 4, 4, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'APM-SPACE-GRAY';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 15, 15, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'XM5-BLACK';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 12, 12, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'XM5-SILVER';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 8, 8, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'G915TKL-TACTILE';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 7, 7, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'G915TKL-LINEAR';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 10, 10, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'GPROX-SL-BLACK';

INSERT INTO movements (variant_id, warehouse_id, quantity, balance, unit_cost, operation_type, description, reference_id, reference_table, user_id, created_at)
SELECT v.id, 2, 8, 8, NULL, 'INVENTORY_ADJUSTMENT', 'Inventario inicial - Almacén SJL', 2, 'warehouses', 1, NOW()
FROM variants v WHERE v.sku = 'GPROX-SL-WHITE';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Consultar stock total por variante (suma de ambos almacenes)
-- SELECT 
--   v.sku, 
--   p.name AS producto,
--   SUM(s.quantity) AS stock_total,
--   SUM(s.reserved_quantity) AS reservado_total
-- FROM stocks s
-- JOIN variants v ON v.id = s.variant_id
-- JOIN products p ON p.id = v.product_id
-- GROUP BY v.sku, p.name
-- ORDER BY p.name, v.sku;

-- Consultar almacenes
-- SELECT * FROM warehouses WHERE is_active = true;

-- Consultar movimientos recientes
-- SELECT 
--   m.id,
--   v.sku,
--   w.name AS almacen,
--   m.quantity,
--   m.operation_type,
--   m.description,
--   m.created_at
-- FROM movements m
-- JOIN variants v ON v.id = m.variant_id
-- JOIN warehouses w ON w.id = m.warehouse_id
-- ORDER BY m.created_at DESC
-- LIMIT 20;
