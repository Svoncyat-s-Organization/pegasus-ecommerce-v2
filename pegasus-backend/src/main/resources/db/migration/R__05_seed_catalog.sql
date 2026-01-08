-- ============================================
-- Seed: Catalog Module (Complete)
-- Tables: brands, categories, category_specifications, variant_attributes,
--         products, product_variant_attributes, variants, images
-- ============================================

-- Clear existing catalog data (order matters for FK constraints)
-- Delete in correct order: children → parents
DELETE FROM order_items;
DELETE FROM images;
DELETE FROM variants;
DELETE FROM product_variant_attributes;
DELETE FROM products;
DELETE FROM category_specifications;
DELETE FROM variant_attributes;
DELETE FROM categories;
DELETE FROM brands;

-- ============================================
-- BRANDS (8 - all brands used in products)
-- ============================================
INSERT INTO brands (name, slug, image_url, is_active) VALUES
('Apple', 'apple', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', true),
('Samsung', 'samsung', 'https://images.samsung.com/is/image/samsung/assets/global/about-us/brand/logo/360_197_1.png', true),
('Sony', 'sony', 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', true),
('Dell', 'dell', 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg', true),
('Xiaomi', 'xiaomi', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Xiaomi_logo_%282021-%29.svg/1200px-Xiaomi_logo_%282021-%29.svg.png', true),
('HP', 'hp', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/1200px-HP_logo_2012.svg.png', true),
('Lenovo', 'lenovo', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Lenovo_Global_Corporate_Logo.png/1280px-Lenovo_Global_Corporate_Logo.png', true),
('LG', 'lg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/LG_logo_%282014%29.svg/1280px-LG_logo_%282014%29.svg.png', true);

-- ============================================
-- CATEGORIES (Hierarchical: 3 parents + 4 children)
-- ============================================
INSERT INTO categories (name, slug, description, image_url, parent_id, is_active) VALUES
('Electrónica', 'electronica', 'Dispositivos electrónicos', 'https://cdn-icons-png.flaticon.com/512/5214/5214029.png', NULL, true),
('Computadoras', 'computadoras', 'Laptops y PCs', 'https://png.pngtree.com/png-clipart/20200224/original/pngtree-computer-and-laptop-vector-illustration-with-simple-line-design-laptop-icon-png-image_5228513.jpg', NULL, true),
('Accesorios', 'accesorios', 'Accesorios tecnológicos', 'https://thumbs.dreamstime.com/b/iconos-de-contorno-dispositivos-electr%C3%B3nicos-y-accesorios-con-elementos-carga-aigenerados-una-colecci%C3%B3n-once-que-representan-un-399093336.jpg', NULL, true);

-- Subcategories
INSERT INTO categories (name, slug, description, image_url, parent_id, is_active)
SELECT 'Smartphones', 'smartphones', 'Teléfonos inteligentes', 'https://placehold.co/400x300?text=Smartphones', id, true
FROM categories WHERE slug = 'electronica';

INSERT INTO categories (name, slug, description, image_url, parent_id, is_active)
SELECT 'Televisores', 'televisores', 'Smart TVs', 'https://placehold.co/400x300?text=TVs', id, true
FROM categories WHERE slug = 'electronica';

INSERT INTO categories (name, slug, description, image_url, parent_id, is_active)
SELECT 'Laptops', 'laptops', 'Computadoras portátiles', 'https://placehold.co/400x300?text=Laptops', id, true
FROM categories WHERE slug = 'computadoras';

INSERT INTO categories (name, slug, description, image_url, parent_id, is_active)
SELECT 'Audífonos', 'audifonos', 'Auriculares y headsets', 'https://placehold.co/400x300?text=Audifonos', id, true
FROM categories WHERE slug = 'accesorios';

-- ============================================
-- CATEGORY_SPECIFICATIONS (Specs per category)
-- ============================================

-- Smartphones specs
INSERT INTO category_specifications (category_id, name, display_name, spec_type, unit, options, is_required, position)
SELECT id, 'screen_size', 'Tamaño de Pantalla', 'NUMBER', 'pulgadas', NULL, true, 1 FROM categories WHERE slug = 'smartphones';
INSERT INTO category_specifications (category_id, name, display_name, spec_type, unit, options, is_required, position)
SELECT id, 'processor', 'Procesador', 'TEXT', NULL, NULL, true, 2 FROM categories WHERE slug = 'smartphones';
INSERT INTO category_specifications (category_id, name, display_name, spec_type, unit, options, is_required, position)
SELECT id, 'camera', 'Cámara Principal', 'TEXT', NULL, NULL, false, 3 FROM categories WHERE slug = 'smartphones';
INSERT INTO category_specifications (category_id, name, display_name, spec_type, unit, options, is_required, position)
SELECT id, 'os', 'Sistema Operativo', 'SELECT', NULL, '["iOS", "Android"]', true, 4 FROM categories WHERE slug = 'smartphones';

-- Laptops specs
INSERT INTO category_specifications (category_id, name, display_name, spec_type, unit, options, is_required, position)
SELECT id, 'screen_size', 'Tamaño de Pantalla', 'NUMBER', 'pulgadas', NULL, true, 1 FROM categories WHERE slug = 'laptops';
INSERT INTO category_specifications (category_id, name, display_name, spec_type, unit, options, is_required, position)
SELECT id, 'processor', 'Procesador', 'TEXT', NULL, NULL, true, 2 FROM categories WHERE slug = 'laptops';
INSERT INTO category_specifications (category_id, name, display_name, spec_type, unit, options, is_required, position)
SELECT id, 'ram_size', 'Memoria RAM', 'NUMBER', 'GB', NULL, true, 3 FROM categories WHERE slug = 'laptops';
INSERT INTO category_specifications (category_id, name, display_name, spec_type, unit, options, is_required, position)
SELECT id, 'storage_size', 'Almacenamiento', 'NUMBER', 'GB', NULL, true, 4 FROM categories WHERE slug = 'laptops';

-- TVs specs
INSERT INTO category_specifications (category_id, name, display_name, spec_type, unit, options, is_required, position)
SELECT id, 'screen_size', 'Tamaño de Pantalla', 'NUMBER', 'pulgadas', NULL, true, 1 FROM categories WHERE slug = 'televisores';
INSERT INTO category_specifications (category_id, name, display_name, spec_type, unit, options, is_required, position)
SELECT id, 'resolution', 'Resolución', 'SELECT', NULL, '["HD", "Full HD", "4K UHD", "8K"]', true, 2 FROM categories WHERE slug = 'televisores';
INSERT INTO category_specifications (category_id, name, display_name, spec_type, unit, options, is_required, position)
SELECT id, 'panel_type', 'Tipo de Panel', 'SELECT', NULL, '["LED", "QLED", "OLED", "Mini LED"]', false, 3 FROM categories WHERE slug = 'televisores';

-- Headphones specs
INSERT INTO category_specifications (category_id, name, display_name, spec_type, unit, options, is_required, position)
SELECT id, 'type', 'Tipo', 'SELECT', NULL, '["Over-ear", "On-ear", "In-ear"]', true, 1 FROM categories WHERE slug = 'audifonos';
INSERT INTO category_specifications (category_id, name, display_name, spec_type, unit, options, is_required, position)
SELECT id, 'noise_cancelling', 'Cancelación de Ruido', 'BOOLEAN', NULL, NULL, false, 2 FROM categories WHERE slug = 'audifonos';
INSERT INTO category_specifications (category_id, name, display_name, spec_type, unit, options, is_required, position)
SELECT id, 'battery_life', 'Duración de Batería', 'NUMBER', 'horas', NULL, false, 3 FROM categories WHERE slug = 'audifonos';

-- ============================================
-- VARIANT_ATTRIBUTES (Global catalog - MUST be before products)
-- ============================================
INSERT INTO variant_attributes (name, display_name, attribute_type, options, description) VALUES
('color', 'Color', 'COLOR', '["Negro", "Blanco", "Gris", "Azul", "Rojo", "Verde", "Dorado", "Plateado"]', 'Colores estándar para productos'),
('size', 'Talla', 'SIZE', '["XS", "S", "M", "L", "XL", "XXL"]', 'Tallas estándar de ropa'),
('storage', 'Almacenamiento', 'TEXT', '["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"]', 'Capacidad de almacenamiento'),
('ram', 'RAM', 'TEXT', '["4GB", "8GB", "16GB", "32GB", "64GB"]', 'Memoria RAM'),
('material', 'Material', 'TEXT', '["Algodón", "Poliéster", "Cuero", "Metal", "Plástico"]', 'Tipo de material');

-- ============================================
-- PRODUCTS (6 products across categories)
-- ============================================

-- Product 1: iPhone 15 Pro (Smartphone)
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-001', 'iPhone 15 Pro', 'iphone-15-pro',
       'iPhone 15 Pro con chip A17 Pro, cámara de 48MP y diseño de titanio.',
       b.id, c.id,
       '{"screen_size": 6.1, "processor": "A17 Pro", "camera": "48MP", "os": "iOS"}'::jsonb,
       true, true
FROM brands b, categories c WHERE b.slug = 'apple' AND c.slug = 'smartphones';

-- Product 2: Samsung Galaxy S24 Ultra (Smartphone)
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-002', 'Samsung Galaxy S24 Ultra', 'galaxy-s24-ultra',
       'Galaxy S24 Ultra con Galaxy AI, S Pen y cámara de 200MP.',
       b.id, c.id,
       '{"screen_size": 6.8, "processor": "Snapdragon 8 Gen 3", "camera": "200MP", "os": "Android"}'::jsonb,
       true, true
FROM brands b, categories c WHERE b.slug = 'samsung' AND c.slug = 'smartphones';

-- Product 3: MacBook Pro 14" (Laptop)
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-003', 'MacBook Pro 14"', 'macbook-pro-14',
       'MacBook Pro con chip M3 Pro, pantalla Liquid Retina XDR.',
       b.id, c.id,
       '{"screen_size": 14.2, "processor": "Apple M3 Pro", "ram_size": 18, "storage_size": 512}'::jsonb,
       true, true
FROM brands b, categories c WHERE b.slug = 'apple' AND c.slug = 'laptops';

-- Product 4: Dell XPS 15 (Laptop)
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-004', 'Dell XPS 15', 'dell-xps-15',
       'Laptop premium con pantalla OLED 3.5K y procesador Intel Core i7.',
       b.id, c.id,
       '{"screen_size": 15.6, "processor": "Intel Core i7-13700H", "ram_size": 16, "storage_size": 512}'::jsonb,
       false, true
FROM brands b, categories c WHERE b.slug = 'dell' AND c.slug = 'laptops';

-- Product 5: Samsung QLED 55" (TV)
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-005', 'Samsung Smart TV 55" QLED 4K', 'samsung-tv-55-qled',
       'Televisor QLED 4K con tecnología Quantum Dot y Gaming Hub.',
       b.id, c.id,
       '{"screen_size": 55, "resolution": "4K UHD", "panel_type": "QLED"}'::jsonb,
       true, true
FROM brands b, categories c WHERE b.slug = 'samsung' AND c.slug = 'televisores';

-- Product 6: Sony WH-1000XM5 (Headphones)
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-006', 'Sony WH-1000XM5', 'sony-wh-1000xm5',
       'Audífonos inalámbricos con la mejor cancelación de ruido.',
       b.id, c.id,
       '{"type": "Over-ear", "noise_cancelling": true, "battery_life": 30}'::jsonb,
       false, true
FROM brands b, categories c WHERE b.slug = 'sony' AND c.slug = 'audifonos';

-- ============================================
-- PRODUCT_VARIANT_ATTRIBUTES (Link products to variant attributes)
-- ============================================

-- iPhone 15 Pro: Color + Storage
INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["Titanio Natural", "Titanio Negro", "Titanio Azul"]'::jsonb, 1
FROM products p, variant_attributes va WHERE p.slug = 'iphone-15-pro' AND va.name = 'color';
INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["128GB", "256GB", "512GB"]'::jsonb, 2
FROM products p, variant_attributes va WHERE p.slug = 'iphone-15-pro' AND va.name = 'storage';

-- Galaxy S24 Ultra: Color + Storage
INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["Negro", "Gris", "Violeta"]'::jsonb, 1
FROM products p, variant_attributes va WHERE p.slug = 'galaxy-s24-ultra' AND va.name = 'color';
INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["256GB", "512GB", "1TB"]'::jsonb, 2
FROM products p, variant_attributes va WHERE p.slug = 'galaxy-s24-ultra' AND va.name = 'storage';

-- MacBook Pro 14": Color + Storage
INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["Plata", "Gris Espacial"]'::jsonb, 1
FROM products p, variant_attributes va WHERE p.slug = 'macbook-pro-14' AND va.name = 'color';
INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["512GB", "1TB"]'::jsonb, 2
FROM products p, variant_attributes va WHERE p.slug = 'macbook-pro-14' AND va.name = 'storage';

-- Dell XPS 15: Color + Storage
INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["Plata", "Negro"]'::jsonb, 1
FROM products p, variant_attributes va WHERE p.slug = 'dell-xps-15' AND va.name = 'color';
INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["512GB", "1TB"]'::jsonb, 2
FROM products p, variant_attributes va WHERE p.slug = 'dell-xps-15' AND va.name = 'storage';

-- Samsung TV: No variant attributes (single model)

-- Sony WH-1000XM5: Color only
INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["Negro", "Plata"]'::jsonb, 1
FROM products p, variant_attributes va WHERE p.slug = 'sony-wh-1000xm5' AND va.name = 'color';

-- ============================================
-- VARIANTS (Multiple per product)
-- ============================================

-- iPhone 15 Pro variants
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'IPH15PRO-128-NAT', 4999.00, '{"color": "Titanio Natural", "storage": "128GB"}'::jsonb, true
FROM products p WHERE p.slug = 'iphone-15-pro';
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'IPH15PRO-256-BLK', 5499.00, '{"color": "Titanio Negro", "storage": "256GB"}'::jsonb, true
FROM products p WHERE p.slug = 'iphone-15-pro';
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'IPH15PRO-512-BLU', 6499.00, '{"color": "Titanio Azul", "storage": "512GB"}'::jsonb, true
FROM products p WHERE p.slug = 'iphone-15-pro';

-- Galaxy S24 Ultra variants
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'S24U-256-BLK', 5299.00, '{"color": "Negro", "storage": "256GB"}'::jsonb, true
FROM products p WHERE p.slug = 'galaxy-s24-ultra';
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'S24U-512-VIO', 5799.00, '{"color": "Violeta", "storage": "512GB"}'::jsonb, true
FROM products p WHERE p.slug = 'galaxy-s24-ultra';

-- MacBook Pro 14" variants
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'MBP14-512-SIL', 8999.00, '{"color": "Plata", "storage": "512GB"}'::jsonb, true
FROM products p WHERE p.slug = 'macbook-pro-14';
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'MBP14-1TB-SG', 9999.00, '{"color": "Gris Espacial", "storage": "1TB"}'::jsonb, true
FROM products p WHERE p.slug = 'macbook-pro-14';

-- Dell XPS 15 variants
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'XPS15-512-SIL', 7499.00, '{"color": "Plata", "storage": "512GB"}'::jsonb, true
FROM products p WHERE p.slug = 'dell-xps-15';
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'XPS15-1TB-BLK', 8299.00, '{"color": "Negro", "storage": "1TB"}'::jsonb, true
FROM products p WHERE p.slug = 'dell-xps-15';

-- Samsung TV variant (single)
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'TV55-QLED-4K', 3299.00, '{}'::jsonb, true
FROM products p WHERE p.slug = 'samsung-tv-55-qled';

-- Sony WH-1000XM5 variants
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'WH1000XM5-BLK', 1499.00, '{"color": "Negro"}'::jsonb, true
FROM products p WHERE p.slug = 'sony-wh-1000xm5';
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'WH1000XM5-SIL', 1499.00, '{"color": "Plata"}'::jsonb, true
FROM products p WHERE p.slug = 'sony-wh-1000xm5';

-- ============================================
-- IMAGES (Primary image per product)
-- ============================================
INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://www.efe.com.pe/media/catalog/product/m/u/mu773bea_1.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=700&width=700&canvas=700:700', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'iphone-15-pro';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://movilcity.pe/cdn/shop/files/Samsung-Galaxy-S24-Ultra-1_a4d20ea6-35bd-444a-a1f6-0807907ec053.webp?v=1716681330&width=1445', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'galaxy-s24-ultra';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://mac-center.com.pe/cdn/shop/files/MacBook_Pro_16-inch_M4_Pro_or_Max_chip_Space_Black_PDP_Image_Position_1__COES_533x.jpg?v=1730313598', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'macbook-pro-14';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://www.colbybrownphotography.com/wp-content/uploads/2016/03/Dell-XPS-15-Front-and-Top-View-1024x560.jpg', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'dell-xps-15';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://coolboxpe.vtexassets.com/arquivos/ids/277259-800-800?v=638795997486230000&width=800&height=800&aspect=true', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'sony-wh-1000xm5';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://plazavea.vteximg.com.br/arquivos/ids/32962656-418-418/20566878-1.jpg', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'samsung-tv-55-qled';

-- ============================================
-- ADDITIONAL PRODUCTS FOR AI RECOMMENDATIONS
-- More products per category to improve recommendation quality
-- ============================================

-- MORE SMARTPHONES (3 additional)
-- Xiaomi 14 Ultra
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-007', 'Xiaomi 14 Ultra', 'xiaomi-14-ultra',
       'Flagship de Xiaomi con cámara Leica profesional de 1 pulgada y carga ultra rápida de 90W.',
       b.id, c.id,
       '{"screen_size": 6.73, "processor": "Snapdragon 8 Gen 3", "camera": "50MP Leica", "os": "Android"}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'xiaomi' AND c.slug = 'smartphones';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'XI14U-256-BLK', 4299.00, '{"storage": "256GB", "color": "Negro"}'::jsonb, true
FROM products p WHERE p.slug = 'xiaomi-14-ultra';

INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["Negro", "Blanco"]'::jsonb, 1
FROM products p, variant_attributes va WHERE p.slug = 'xiaomi-14-ultra' AND va.name = 'color';
INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["256GB", "512GB"]'::jsonb, 2
FROM products p, variant_attributes va WHERE p.slug = 'xiaomi-14-ultra' AND va.name = 'storage';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://migractec.com/wp-content/uploads/2024/07/xiaomi-14.png', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'xiaomi-14-ultra';

-- Samsung Galaxy A55
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-008', 'Samsung Galaxy A55', 'galaxy-a55',
       'Smartphone de gama media con pantalla Super AMOLED, resistencia al agua IP67 y cámara de 50MP.',
       b.id, c.id,
       '{"screen_size": 6.6, "processor": "Exynos 1480", "camera": "50MP", "os": "Android"}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'samsung' AND c.slug = 'smartphones';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'A55-128-LIL', 1699.00, '{"storage": "128GB", "color": "Lila"}'::jsonb, true
FROM products p WHERE p.slug = 'galaxy-a55';

INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["Lila", "Negro", "Azul"]'::jsonb, 1
FROM products p, variant_attributes va WHERE p.slug = 'galaxy-a55' AND va.name = 'color';
INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["128GB", "256GB"]'::jsonb, 2
FROM products p, variant_attributes va WHERE p.slug = 'galaxy-a55' AND va.name = 'storage';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://www.peru-smart.com/wp-content/uploads/2025/03/CELU721NAVY-128GB.jpg', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'galaxy-a55';

-- iPhone 14
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-009', 'iPhone 14', 'iphone-14',
       'iPhone 14 con chip A15 Bionic, sistema de doble cámara avanzado y detección de accidentes.',
       b.id, c.id,
       '{"screen_size": 6.1, "processor": "A15 Bionic", "camera": "12MP dual", "os": "iOS"}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'apple' AND c.slug = 'smartphones';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'IPH14-128-BLU', 3499.00, '{"storage": "128GB", "color": "Azul"}'::jsonb, true
FROM products p WHERE p.slug = 'iphone-14';

INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["Azul", "Negro", "Morado"]'::jsonb, 1
FROM products p, variant_attributes va WHERE p.slug = 'iphone-14' AND va.name = 'color';
INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["128GB", "256GB"]'::jsonb, 2
FROM products p, variant_attributes va WHERE p.slug = 'iphone-14' AND va.name = 'storage';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://laptronic.pe/catalogo/wp-content/uploads/image-600x600.png', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'iphone-14';

-- MORE LAPTOPS (3 additional)
-- Dell XPS 15 9520 (diferente modelo al PROD-004)
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-010', 'Dell XPS 15 9520', 'dell-xps-15-9520',
       'Laptop premium con pantalla OLED 3.5K, procesador Intel Core i9 de 12va generación.',
       b.id, c.id,
       '{"screen_size": 15.6, "processor": "Intel Core i9-12900HK", "ram_size": 32, "storage_size": 1024}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'dell' AND c.slug = 'laptops';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'XPS15-I9-1TB-SIL', 8999.00, '{"storage": "1TB", "color": "Plata"}'::jsonb, true
FROM products p WHERE p.slug = 'dell-xps-15-9520';

INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["Plata", "Negro"]'::jsonb, 1
FROM products p, variant_attributes va WHERE p.slug = 'dell-xps-15-9520' AND va.name = 'color';
INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["1TB", "2TB"]'::jsonb, 2
FROM products p, variant_attributes va WHERE p.slug = 'dell-xps-15-9520' AND va.name = 'storage';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://i5.walmartimages.com/seo/Dell-XPS-15-9520-Laptop-2022-15-6-4K-Touch-Core-i9-1TB-SSD-32GB-RAM-3050-Ti-14-Cores-5-GHz-12th-Gen-CPU_df471863-0fd7-49ab-8585-2585245b1b24.fe6dc231ec9cd6b9862bd54d5933e13f.jpeg', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'dell-xps-15-9520';

-- Lenovo ThinkPad X1 Carbon
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-011', 'Lenovo ThinkPad X1 Carbon', 'thinkpad-x1-carbon',
       'Ultrabook empresarial con diseño ultraligero, teclado legendario y seguridad empresarial.',
       b.id, c.id,
       '{"screen_size": 14, "processor": "Intel Core i7-1365U", "ram_size": 16, "storage_size": 512}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'lenovo' AND c.slug = 'laptops';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'X1C-I7-512-BLK', 8299.00, '{"storage": "512GB", "color": "Negro"}'::jsonb, true
FROM products p WHERE p.slug = 'thinkpad-x1-carbon';

INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["Negro"]'::jsonb, 1
FROM products p, variant_attributes va WHERE p.slug = 'thinkpad-x1-carbon' AND va.name = 'color';
INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["512GB", "1TB"]'::jsonb, 2
FROM products p, variant_attributes va WHERE p.slug = 'thinkpad-x1-carbon' AND va.name = 'storage';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://www.kabifperu.com/imagenes/prod-20022021135026-notebook-lenovo-thinkpad-x1-carbon-14-fhd-intel-core-i7-8565u-1-80ghz-16gb-lpddr3-deta.png', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'thinkpad-x1-carbon';

-- HP Spectre x360
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-012', 'HP Spectre x360 14', 'hp-spectre-x360',
       'Laptop convertible 2 en 1 con pantalla táctil OLED y diseño elegante en aluminio.',
       b.id, c.id,
       '{"screen_size": 14, "processor": "Intel Core i7-1355U", "ram_size": 16, "storage_size": 1024}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'hp' AND c.slug = 'laptops';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'SPEC360-I7-1TB-BLU', 6999.00, '{"storage": "1TB", "color": "Azul Poseidón"}'::jsonb, true
FROM products p WHERE p.slug = 'hp-spectre-x360';

INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["Azul Poseidón", "Negro"]'::jsonb, 1
FROM products p, variant_attributes va WHERE p.slug = 'hp-spectre-x360' AND va.name = 'color';
INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["512GB", "1TB"]'::jsonb, 2
FROM products p, variant_attributes va WHERE p.slug = 'hp-spectre-x360' AND va.name = 'storage';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://www.magitech.pe/media/catalog/product/cache/1/image/600x/040ec09b1e35df139433887a97daa66f/7/_/7_17_1.jpg', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'hp-spectre-x360';

-- MORE AUDÍFONOS (3 additional)
-- Apple AirPods Pro 2
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-013', 'Apple AirPods Pro 2', 'airpods-pro-2',
       'Audífonos in-ear con cancelación activa de ruido, audio espacial personalizado y chip H2.',
       b.id, c.id,
       '{"type": "In-ear", "noise_cancelling": true, "battery_life": 6}'::jsonb,
       true, true
FROM brands b, categories c
WHERE b.slug = 'apple' AND c.slug = 'audifonos';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'APP2-WHT', 1099.00, '{"color": "Blanco"}'::jsonb, true
FROM products p WHERE p.slug = 'airpods-pro-2';

INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["Blanco"]'::jsonb, 1
FROM products p, variant_attributes va WHERE p.slug = 'airpods-pro-2' AND va.name = 'color';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1660803972361', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'airpods-pro-2';

-- Samsung Galaxy Buds2 Pro
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-014', 'Samsung Galaxy Buds2 Pro', 'galaxy-buds2-pro',
       'Audífonos premium con sonido Hi-Fi de 24 bits, ANC inteligente y audio 360.',
       b.id, c.id,
       '{"type": "In-ear", "noise_cancelling": true, "battery_life": 5}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'samsung' AND c.slug = 'audifonos';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'BUDS2P-GRA', 799.00, '{"color": "Grafito"}'::jsonb, true
FROM products p WHERE p.slug = 'galaxy-buds2-pro';

INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["Grafito", "Blanco", "Violeta"]'::jsonb, 1
FROM products p, variant_attributes va WHERE p.slug = 'galaxy-buds2-pro' AND va.name = 'color';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://rimage.ripley.com.pe/home.ripley/Attachment/MKP/3846/PMP20000336777/full_image-1.jpeg', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'galaxy-buds2-pro';

-- Sony WF-1000XM5
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-015', 'Sony WF-1000XM5', 'sony-wf-1000xm5',
       'Los audífonos in-ear más pequeños del mundo con cancelación de ruido líder en la industria.',
       b.id, c.id,
       '{"type": "In-ear", "noise_cancelling": true, "battery_life": 8}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'sony' AND c.slug = 'audifonos';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'WF1000XM5-BLK', 1299.00, '{"color": "Negro"}'::jsonb, true
FROM products p WHERE p.slug = 'sony-wf-1000xm5';

INSERT INTO product_variant_attributes (product_id, variant_attribute_id, custom_options, position)
SELECT p.id, va.id, '["Negro", "Plata"]'::jsonb, 1
FROM products p, variant_attributes va WHERE p.slug = 'sony-wf-1000xm5' AND va.name = 'color';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://sony.scene7.com/is/image/sonyglobalsolutions/Primary_image_black?$categorypdpnav$&fmt=png-alpha', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'sony-wf-1000xm5';

-- MORE TELEVISORES (3 additional)
-- LG OLED C3 55"
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-016', 'LG OLED C3 55"', 'lg-oled-c3-55',
       'TV OLED evo con procesador α9 Gen6, Dolby Vision IQ, Dolby Atmos y 4 puertos HDMI 2.1.',
       b.id, c.id,
       '{"screen_size": 55, "resolution": "4K UHD", "panel_type": "OLED"}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'lg' AND c.slug = 'televisores';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'LG-C3-55-BLK', 5499.00, '{}'::jsonb, true
FROM products p WHERE p.slug = 'lg-oled-c3-55';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://www.efe.com.pe/media/catalog/product/o/l/oled55c3psa_1.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=700&width=700&canvas=700:700', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'lg-oled-c3-55';

-- Sony Bravia XR A80L
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-017', 'Sony Bravia XR A80L 65"', 'sony-bravia-a80l-65',
       'TV OLED con procesador cognitivo XR, Acoustic Surface Audio+ y perfecta para PS5.',
       b.id, c.id,
       '{"screen_size": 65, "resolution": "4K UHD", "panel_type": "OLED"}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'sony' AND c.slug = 'televisores';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'A80L-65-BLK', 7999.00, '{}'::jsonb, true
FROM products p WHERE p.slug = 'sony-bravia-a80l-65';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://sony.scene7.com/is/image/sonyglobalsolutions/TVFY23_A80L_65_WW_0_insitu_M?$productIntroPlatemobile$&fmt=png-alpha', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'sony-bravia-a80l-65';

-- Samsung Neo QLED 65"
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-018', 'Samsung Neo QLED 65" QN90C', 'samsung-neo-qled-65',
       'TV Neo QLED con tecnología Quantum Matrix, Neural Quantum Processor y Gaming Hub.',
       b.id, c.id,
       '{"screen_size": 65, "resolution": "4K UHD", "panel_type": "QLED"}'::jsonb,
       true, true
FROM brands b, categories c
WHERE b.slug = 'samsung' AND c.slug = 'televisores';



INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://images.samsung.com/is/image/samsung/p6pim/pe/qn65qn85bagxpe/gallery/pe-qled-tv-qn65qn85bagxpe-front-silver-538304786', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'samsung-neo-qled-65';




