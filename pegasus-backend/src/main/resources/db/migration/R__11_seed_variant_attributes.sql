-- ============================================
-- Repeatable Migration: Seed Global Variant Attributes
-- Common attributes used across product variants
-- ============================================

-- Clear existing data for idempotent execution
DELETE FROM public.variant_attributes WHERE name IN ('color', 'size', 'storage', 'ram', 'material');

-- Insert global variant attributes
INSERT INTO public.variant_attributes (name, display_name, attribute_type, options, description, is_active)
VALUES
    -- Color attribute (most common)
    ('color', 'Color', 'COLOR', '["Negro", "Blanco", "Gris", "Azul", "Rojo", "Verde", "Amarillo", "Rosa", "Morado", "Naranja", "Dorado", "Plateado"]', 'Colores estándar para productos', true),
    
    -- Size attribute for clothing
    ('size', 'Talla', 'SIZE', '["XS", "S", "M", "L", "XL", "XXL", "XXXL"]', 'Tallas estándar de ropa', true),
    
    -- Storage capacity for electronics
    ('storage', 'Almacenamiento', 'TEXT', '["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB"]', 'Capacidad de almacenamiento para dispositivos electrónicos', true),
    
    -- RAM for computers/phones
    ('ram', 'RAM', 'TEXT', '["2GB", "4GB", "6GB", "8GB", "12GB", "16GB", "32GB", "64GB"]', 'Memoria RAM para dispositivos electrónicos', true),
    
    -- Material for various products
    ('material', 'Material', 'TEXT', '["Algodón", "Poliéster", "Lana", "Seda", "Cuero", "Plástico", "Metal", "Madera", "Vidrio"]', 'Tipo de material del producto', true);
