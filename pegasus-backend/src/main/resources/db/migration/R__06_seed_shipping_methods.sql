-- ============================================
-- Seed: Shipping Methods (Catalog)
-- Note: These are configuration entries, not transactions
-- Pegasus is 100% online - no physical store pickup
-- ============================================

DELETE FROM shipping_methods;

INSERT INTO shipping_methods (name, description, carrier, estimated_days_min, estimated_days_max, base_cost, cost_per_kg, is_active) VALUES
-- Standard shipping options (Lima Metropolitana)
('Envío Estándar Lima', 'Entrega a domicilio en Lima Metropolitana en 2-3 días hábiles', 'Olva Courier', 2, 3, 10.00, 2.00, true),
('Envío Express Lima', 'Entrega a domicilio en Lima Metropolitana en 24 horas', 'Olva Courier', 1, 1, 25.00, 5.00, true),

-- Standard shipping options (Provincias)
('Envío Estándar Provincias', 'Entrega a domicilio en provincias en 5-7 días hábiles', 'Olva Courier', 5, 7, 20.00, 3.00, true),
('Envío Express Provincias', 'Entrega a domicilio en provincias en 2-3 días hábiles', 'Olva Courier', 2, 3, 45.00, 6.00, true),

-- Alternative carriers (económicos)
('Shalom Lima', 'Envío económico a domicilio en Lima', 'Shalom', 3, 5, 8.00, 1.50, true),
('Shalom Provincias', 'Envío económico a domicilio en provincias', 'Shalom', 7, 10, 15.00, 2.50, true),

-- Premium options (Lima only)
('Same Day Lima', 'Entrega a domicilio el mismo día en Lima (pedidos antes de las 2pm)', 'Motorizado Propio', 0, 0, 35.00, 8.00, true);
