-- ============================================
-- SEED: Métodos de Envío (Shipping Methods)
-- Archivo: R__06_seed_shipping_methods.sql
-- Descripción: Datos de métodos de envío disponibles para Perú
-- ============================================

-- Limpiar datos existentes para idempotencia
DELETE FROM shipping_methods;

-- Reiniciar secuencia
ALTER SEQUENCE shipping_methods_id_seq RESTART WITH 1;

-- ============================================
-- MÉTODOS DE ENVÍO ESTÁNDAR PARA PERÚ
-- ============================================

-- 1. Envío Express (1-2 días) - Lima Metropolitana
INSERT INTO shipping_methods (
    name,
    description,
    carrier,
    estimated_days_min,
    estimated_days_max,
    base_cost,
    cost_per_kg,
    is_active,
    created_at,
    updated_at
) VALUES (
    'Envío Express',
    'Entrega rápida en 24-48 horas para Lima Metropolitana',
    'Olva Courier',
    1,
    2,
    15.00,
    2.00,
    true,
    NOW(),
    NOW()
);

-- 2. Envío Estándar (3-5 días) - Lima y Callao
INSERT INTO shipping_methods (
    name,
    description,
    carrier,
    estimated_days_min,
    estimated_days_max,
    base_cost,
    cost_per_kg,
    is_active,
    created_at,
    updated_at
) VALUES (
    'Envío Estándar',
    'Entrega en 3-5 días hábiles para Lima y Callao',
    'Shalom',
    3,
    5,
    10.00,
    1.50,
    true,
    NOW(),
    NOW()
);

-- 3. Envío Nacional (5-7 días) - Todo el Perú
INSERT INTO shipping_methods (
    name,
    description,
    carrier,
    estimated_days_min,
    estimated_days_max,
    base_cost,
    cost_per_kg,
    is_active,
    created_at,
    updated_at
) VALUES (
    'Envío Nacional',
    'Entrega a nivel nacional en 5-7 días hábiles',
    'Olva Courier',
    5,
    7,
    20.00,
    3.00,
    true,
    NOW(),
    NOW()
);

-- 4. Recojo en Tienda (0 días) - Gratis
INSERT INTO shipping_methods (
    name,
    description,
    carrier,
    estimated_days_min,
    estimated_days_max,
    base_cost,
    cost_per_kg,
    is_active,
    created_at,
    updated_at
) VALUES (
    'Recojo en Tienda',
    'Recoge tu pedido en nuestras tiendas sin costo adicional',
    'Pegasus E-commerce',
    0,
    0,
    0.00,
    0.00,
    true,
    NOW(),
    NOW()
);

-- 5. Envío Premium (1 día) - Lima Centro
INSERT INTO shipping_methods (
    name,
    description,
    carrier,
    estimated_days_min,
    estimated_days_max,
    base_cost,
    cost_per_kg,
    is_active,
    created_at,
    updated_at
) VALUES (
    'Envío Premium Same Day',
    'Entrega el mismo día para Lima Centro (solo pedidos antes de las 3 PM)',
    'Rappi',
    1,
    1,
    25.00,
    5.00,
    true,
    NOW(),
    NOW()
);

-- ============================================
-- MÉTODO DESACTIVADO (Ejemplo)
-- ============================================

-- 6. Envío Internacional (Desactivado)
INSERT INTO shipping_methods (
    name,
    description,
    carrier,
    estimated_days_min,
    estimated_days_max,
    base_cost,
    cost_per_kg,
    is_active,
    created_at,
    updated_at
) VALUES (
    'Envío Internacional',
    'Envíos fuera del Perú (temporalmente no disponible)',
    'DHL Express',
    10,
    15,
    80.00,
    10.00,
    false,
    NOW(),
    NOW()
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Consultar métodos activos
-- SELECT id, name, carrier, base_cost, cost_per_kg, estimated_days_min, estimated_days_max, is_active FROM shipping_methods WHERE is_active = true ORDER BY base_cost;
