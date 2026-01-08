-- ============================================
-- Seed: Catalog Module (Complete)
-- Tables: brands, categories, category_specifications, variant_attributes,
--         products, product_variant_attributes, variants, images
-- ============================================

-- Clear existing catalog data (order matters for FK constraints)
DELETE FROM images;
DELETE FROM variants;
DELETE FROM product_variant_attributes;
DELETE FROM products;
DELETE FROM category_specifications;
DELETE FROM variant_attributes;
DELETE FROM categories;
DELETE FROM brands;

-- ============================================
-- BRANDS (4)
-- ============================================
INSERT INTO brands (name, slug, image_url, is_active) VALUES
('Apple', 'apple', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', true),
('Samsung', 'samsung', 'https://images.samsung.com/is/image/samsung/assets/global/about-us/brand/logo/360_197_1.png', true),
('Sony', 'sony', 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', true),
('Dell', 'dell', 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg', true);

-- ============================================
-- CATEGORIES (Hierarchical: 3 parents + 4 children)
-- ============================================
INSERT INTO categories (name, slug, description, image_url, parent_id, is_active) VALUES
('Electrónica', 'electronica', 'Dispositivos electrónicos', 'https://placehold.co/400x300?text=Electronica', NULL, true),
('Computadoras', 'computadoras', 'Laptops y PCs', 'https://placehold.co/400x300?text=Computadoras', NULL, true),
('Accesorios', 'accesorios', 'Accesorios tecnológicos', 'https://placehold.co/400x300?text=Accesorios', NULL, true);

-- Subcategories
INSERT INTO categories (name, slug, description, image_url, parent_id, is_active)
SELECT 'Smartphones', 'smartphones', 'Teléfonos inteligentes', 'https://imgmedia.larepublica.pe/1000x590/larepublica/original/2022/04/13/62575446fee08773835d4232.webp', id, true
FROM categories WHERE slug = 'electronica';

INSERT INTO categories (name, slug, description, image_url, parent_id, is_active)
SELECT 'Televisores', 'televisores', 'Smart TVs', 'https://images.samsung.com/is/image/samsung/assets/pe/tvs/tv-buying-guide/best-picture-quality-tv/2023-tv-buying-guide-the-best-tv-picture-quality-f01-1-mo.jpg?$FB_TYPE_J_F_MO_JPG$', id, true
FROM categories WHERE slug = 'electronica';

INSERT INTO categories (name, slug, description, image_url, parent_id, is_active)
SELECT 'Laptops', 'laptops', 'Computadoras portátiles', 'https://i5.walmartimages.com/seo/Core-Innovations-14-1-PC-Laptops-Intel-Celeron-N3350-4GB-RAM-64GB-HD-Windows-10-Black_284506f7-e71d-4c89-b2e1-d601bd286139.fe69252546bfccdf9dec49b10307de3f.jpeg', id, true
FROM categories WHERE slug = 'computadoras';

INSERT INTO categories (name, slug, description, image_url, parent_id, is_active)
SELECT 'Audífonos', 'audifonos', 'Auriculares y headsets', 'https://assets.bose.com/content/dam/cloudassets/Bose_DAM/Web/consumer_electronics/global/products/headphones/qc-headphonearn/product_silo_image/AEM_QCH_CHILLED-LILAC_PDP_ECOMM-GALLERY_IMG-1.png/jcr:content/renditions/cq5dam.web.1920.1920.png', id, true
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
SELECT 'https://pe.tiendasishop.com/cdn/shop/files/IMG-10935051_c217d008-b374-4d0d-adbf-16768c816296.jpg?v=1722624560&width=823', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'iphone-15-pro';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://plazavea.vteximg.com.br/arquivos/ids/28989669-418-418/imageUrl_3.jpg', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'galaxy-s24-ultra';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://mac-center.com.pe/cdn/shop/files/MacBook_Pro_14-inch_M3_Pro.jpg', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'macbook-pro-14';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://plazavea.vteximg.com.br/arquivos/ids/30343259-450-450/imageUrl_1.jpg?v=638705342892900000', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'dell-xps-15';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://plazavea.vteximg.com.br/arquivos/ids/32962656-418-418/samsung-tv-qled.jpg', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'samsung-tv-55-qled';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://coolboxpe.vtexassets.com/arquivos/ids/277259-800-800/sony-wh1000xm5.jpg', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'sony-wh-1000xm5';
