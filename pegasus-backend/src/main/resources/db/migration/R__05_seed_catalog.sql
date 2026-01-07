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
('Apple', 'apple', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', true),
('Samsung', 'samsung', 'https://images.samsung.com/is/image/samsung/assets/global/about-us/brand/logo/360_197_1.png?$720_N_PNG$', true),
('Sony', 'sony', 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', true),
('LG', 'lg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/LG_logo_%282014%29.svg/1280px-LG_logo_%282014%29.svg.png', true),
('Xiaomi', 'xiaomi', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Xiaomi_logo_%282021-%29.svg/1200px-Xiaomi_logo_%282021-%29.svg.png', true),
('HP', 'hp', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/1200px-HP_logo_2012.svg.png', true),
('Dell', 'dell', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Dell_Logo.svg/2048px-Dell_Logo.svg.png', true),
('Lenovo', 'lenovo', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Lenovo_Global_Corporate_Logo.png/1280px-Lenovo_Global_Corporate_Logo.png', true);

-- Categories (hierarchical)
INSERT INTO categories (name, slug, description, image_url, parent_id, is_active) VALUES
('Electrónica', 'electronica', 'Dispositivos electrónicos', 'https://www.shutterstock.com/image-vector/consumer-electronics-vector-solid-icon-600nw-2100486643.jpg', NULL, true),
('Computadoras', 'computadoras', 'Laptops y PCs', 'https://img.freepik.com/vector-premium/icono-computadora_268104-5248.jpg', NULL, true),
('Accesorios', 'accesorios', 'Accesorios tecnológicos', 'https://static.vecteezy.com/system/resources/previews/005/653/088/non_2x/phones-and-accessories-glyph-icon-smartphone-and-headphones-electronic-devices-e-commerce-department-online-shopping-categories-silhouette-symbol-negative-space-isolated-illustration-vector.jpg', NULL, true);

-- Subcategories
INSERT INTO categories (name, slug, description, image_url, parent_id, is_active)
SELECT 'Smartphones', 'smartphones', 'Teléfonos inteligentes', 'https://static.vecteezy.com/system/resources/thumbnails/006/795/445/small/smartphone-icon-cellphone-mobile-phone-sign-symbol-vector.jpg', id, true FROM categories WHERE slug = 'electronica';
INSERT INTO categories (name, slug, description, image_url, parent_id, is_active)
SELECT 'Tablets', 'tablets', 'Tabletas electrónicas', 'https://img.freepik.com/vector-premium/icono-tableta_1076610-54215.jpg?semt=ais_hybrid&w=740&q=80', id, true FROM categories WHERE slug = 'electronica';
INSERT INTO categories (name, slug, description, image_url, parent_id, is_active)
SELECT 'Televisores', 'televisores', 'Smart TVs y monitores', 'https://static.vecteezy.com/system/resources/thumbnails/010/451/460/small/tv-monitor-icon-isolated-on-white-background-free-vector.jpg', id, true FROM categories WHERE slug = 'electronica';

INSERT INTO categories (name, slug, description, image_url, parent_id, is_active)
SELECT 'Laptops', 'laptops', 'Computadoras portátiles', 'https://img.freepik.com/vector-premium/plantilla-diseno-vectorial-iconos-portatiles-simple-limpia_1309366-977.jpg?semt=ais_hybrid&w=740&q=80', id, true FROM categories WHERE slug = 'computadoras';
INSERT INTO categories (name, slug, description, image_url, parent_id, is_active)
SELECT 'PCs de Escritorio', 'pcs-escritorio', 'Computadoras de escritorio', 'https://placehold.co/400x300?text=PCs', id, true FROM categories WHERE slug = 'computadoras';

INSERT INTO categories (name, slug, description, image_url, parent_id, is_active)
SELECT 'Audífonos', 'audifonos', 'Auriculares y headsets', 'https://img.freepik.com/vector-premium/icono-auriculares-png_564384-696.jpg', id, true FROM categories WHERE slug = 'accesorios';

INSERT INTO categories (name, slug, description, image_url, parent_id, is_active)
SELECT 'Cargadores', 'cargadores', 'Cargadores y cables', 'https://img.freepik.com/vector-premium/icono-cargador-telefono_861234-1868.jpg', id, true FROM categories WHERE slug = 'accesorios';

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
SELECT 'https://www.efe.com.pe/media/catalog/product/m/u/mu773bea_1.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=700&width=700&canvas=700:700', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'iphone-15-pro';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://movilcity.pe/cdn/shop/files/Samsung-Galaxy-S24-Ultra-1_a4d20ea6-35bd-444a-a1f6-0807907ec053.webp?v=1716681330&width=1445', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'galaxy-s24-ultra';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://mac-center.com.pe/cdn/shop/files/MacBook_Pro_16-inch_M4_Pro_or_Max_chip_Space_Black_PDP_Image_Position_1__COES_533x.jpg?v=1730313598', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'macbook-pro-14';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://coolboxpe.vtexassets.com/arquivos/ids/277259-800-800?v=638795997486230000&width=800&height=800&aspect=true', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'sony-wh-1000xm5';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://plazavea.vteximg.com.br/arquivos/ids/32962656-418-418/20566878-1.jpg', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'samsung-tv-55-qled';
