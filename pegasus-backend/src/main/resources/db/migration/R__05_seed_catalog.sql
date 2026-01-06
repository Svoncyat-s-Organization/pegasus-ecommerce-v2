-- ============================================
-- Seed: Catalog (Brands, Categories, Products, Variants, Images)
-- Note: This is product catalog data, not transactional
-- ============================================

-- Clear existing catalog data
DELETE FROM images;
DELETE FROM variants;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM brands;

-- Brands
INSERT INTO brands (name, slug, image_url, is_active) VALUES
('Apple', 'apple', 'https://placehold.co/200x200?text=Apple', true),
('Samsung', 'samsung', 'https://placehold.co/200x200?text=Samsung', true),
('Sony', 'sony', 'https://placehold.co/200x200?text=Sony', true),
('LG', 'lg', 'https://placehold.co/200x200?text=LG', true),
('Xiaomi', 'xiaomi', 'https://placehold.co/200x200?text=Xiaomi', true),
('HP', 'hp', 'https://placehold.co/200x200?text=HP', true),
('Dell', 'dell', 'https://placehold.co/200x200?text=Dell', true),
('Lenovo', 'lenovo', 'https://placehold.co/200x200?text=Lenovo', true);

-- Categories (hierarchical)
INSERT INTO categories (name, slug, description, parent_id, is_active) VALUES
('Electrónica', 'electronica', 'Dispositivos electrónicos', NULL, true),
('Computadoras', 'computadoras', 'Laptops y PCs', NULL, true),
('Accesorios', 'accesorios', 'Accesorios tecnológicos', NULL, true);

-- Subcategories
INSERT INTO categories (name, slug, description, parent_id, is_active)
SELECT 'Smartphones', 'smartphones', 'Teléfonos inteligentes', id, true FROM categories WHERE slug = 'electronica';
INSERT INTO categories (name, slug, description, parent_id, is_active)
SELECT 'Tablets', 'tablets', 'Tabletas electrónicas', id, true FROM categories WHERE slug = 'electronica';
INSERT INTO categories (name, slug, description, parent_id, is_active)
SELECT 'Televisores', 'televisores', 'Smart TVs y monitores', id, true FROM categories WHERE slug = 'electronica';

INSERT INTO categories (name, slug, description, parent_id, is_active)
SELECT 'Laptops', 'laptops', 'Computadoras portátiles', id, true FROM categories WHERE slug = 'computadoras';
INSERT INTO categories (name, slug, description, parent_id, is_active)
SELECT 'PCs de Escritorio', 'pcs-escritorio', 'Computadoras de escritorio', id, true FROM categories WHERE slug = 'computadoras';

INSERT INTO categories (name, slug, description, parent_id, is_active)
SELECT 'Audífonos', 'audifonos', 'Auriculares y headsets', id, true FROM categories WHERE slug = 'accesorios';
INSERT INTO categories (name, slug, description, parent_id, is_active)
SELECT 'Cargadores', 'cargadores', 'Cargadores y cables', id, true FROM categories WHERE slug = 'accesorios';

-- Products with variants
-- Product 1: iPhone 15 Pro
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-001', 'iPhone 15 Pro', 'iphone-15-pro', 
       'El iPhone 15 Pro cuenta con el chip A17 Pro, sistema de cámara profesional y diseño de titanio.',
       b.id, c.id,
       '{"display": "6.1 pulgadas", "chip": "A17 Pro", "camera": "48MP", "storage_options": ["128GB", "256GB", "512GB"]}'::jsonb,
       true, true
FROM brands b, categories c
WHERE b.slug = 'apple' AND c.slug = 'smartphones';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'IPH15PRO-128-NAT', 4999.00, '{"storage": "128GB", "color": "Titanio Natural"}'::jsonb, true
FROM products p WHERE p.slug = 'iphone-15-pro';
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'IPH15PRO-256-NAT', 5499.00, '{"storage": "256GB", "color": "Titanio Natural"}'::jsonb, true
FROM products p WHERE p.slug = 'iphone-15-pro';
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'IPH15PRO-256-BLK', 5499.00, '{"storage": "256GB", "color": "Titanio Negro"}'::jsonb, true
FROM products p WHERE p.slug = 'iphone-15-pro';

-- Product 2: Samsung Galaxy S24 Ultra
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-002', 'Samsung Galaxy S24 Ultra', 'galaxy-s24-ultra',
       'Galaxy S24 Ultra con Galaxy AI, S Pen integrado y cámara de 200MP.',
       b.id, c.id,
       '{"display": "6.8 pulgadas", "chip": "Snapdragon 8 Gen 3", "camera": "200MP", "ram": "12GB"}'::jsonb,
       true, true
FROM brands b, categories c
WHERE b.slug = 'samsung' AND c.slug = 'smartphones';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'S24U-256-BLK', 5299.00, '{"storage": "256GB", "color": "Negro"}'::jsonb, true
FROM products p WHERE p.slug = 'galaxy-s24-ultra';
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'S24U-512-VIO', 5799.00, '{"storage": "512GB", "color": "Violeta"}'::jsonb, true
FROM products p WHERE p.slug = 'galaxy-s24-ultra';

-- Product 3: MacBook Pro 14"
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-003', 'MacBook Pro 14"', 'macbook-pro-14',
       'MacBook Pro con chip M3 Pro, pantalla Liquid Retina XDR y hasta 18 horas de batería.',
       b.id, c.id,
       '{"display": "14.2 pulgadas", "chip": "M3 Pro", "ram": "18GB", "storage": "512GB SSD"}'::jsonb,
       true, true
FROM brands b, categories c
WHERE b.slug = 'apple' AND c.slug = 'laptops';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'MBP14-M3P-512-SIL', 8999.00, '{"storage": "512GB", "color": "Plata"}'::jsonb, true
FROM products p WHERE p.slug = 'macbook-pro-14';
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'MBP14-M3P-1TB-SG', 9999.00, '{"storage": "1TB", "color": "Gris Espacial"}'::jsonb, true
FROM products p WHERE p.slug = 'macbook-pro-14';

-- Product 4: Sony WH-1000XM5
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-004', 'Sony WH-1000XM5', 'sony-wh-1000xm5',
       'Audífonos inalámbricos con la mejor cancelación de ruido del mercado.',
       b.id, c.id,
       '{"type": "Over-ear", "noise_cancelling": true, "battery": "30 horas", "bluetooth": "5.2"}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'sony' AND c.slug = 'audifonos';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'WH1000XM5-BLK', 1499.00, '{"color": "Negro"}'::jsonb, true
FROM products p WHERE p.slug = 'sony-wh-1000xm5';
INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'WH1000XM5-SIL', 1499.00, '{"color": "Plata"}'::jsonb, true
FROM products p WHERE p.slug = 'sony-wh-1000xm5';

-- Product 5: Samsung Smart TV 55"
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-005', 'Samsung Smart TV 55" QLED 4K', 'samsung-tv-55-qled',
       'Televisor QLED 4K con tecnología Quantum Dot y Gaming Hub.',
       b.id, c.id,
       '{"size": "55 pulgadas", "resolution": "4K UHD", "panel": "QLED", "refresh_rate": "120Hz"}'::jsonb,
       true, true
FROM brands b, categories c
WHERE b.slug = 'samsung' AND c.slug = 'televisores';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'TV55-QLED-4K', 3299.00, '{"model": "QN55Q80C"}'::jsonb, true
FROM products p WHERE p.slug = 'samsung-tv-55-qled';

-- Images for products
INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://placehold.co/600x600?text=iPhone+15+Pro', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'iphone-15-pro';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://placehold.co/600x600?text=Galaxy+S24+Ultra', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'galaxy-s24-ultra';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://placehold.co/600x600?text=MacBook+Pro+14', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'macbook-pro-14';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://placehold.co/600x600?text=Sony+WH-1000XM5', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'sony-wh-1000xm5';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://placehold.co/600x600?text=Samsung+TV+55', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'samsung-tv-55-qled';
