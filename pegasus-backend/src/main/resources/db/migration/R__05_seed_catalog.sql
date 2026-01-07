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

-- ============================================
-- ADDITIONAL PRODUCTS FOR AI RECOMMENDATIONS
-- More products per category to improve recommendation quality
-- ============================================

-- MORE SMARTPHONES (3 additional)
-- Xiaomi 14 Ultra
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-006', 'Xiaomi 14 Ultra', 'xiaomi-14-ultra',
       'Flagship de Xiaomi con cámara Leica profesional de 1 pulgada y carga ultra rápida de 90W.',
       b.id, c.id,
       '{"display": "6.73 pulgadas AMOLED", "chip": "Snapdragon 8 Gen 3", "camera": "50MP Leica", "battery": "5000mAh"}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'xiaomi' AND c.slug = 'smartphones';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'XI14U-256-BLK', 4299.00, '{"storage": "256GB", "color": "Negro"}'::jsonb, true
FROM products p WHERE p.slug = 'xiaomi-14-ultra';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1708939245.56420498!400x400!85.png', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'xiaomi-14-ultra';

-- Samsung Galaxy A55
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-007', 'Samsung Galaxy A55', 'galaxy-a55',
       'Smartphone de gama media con pantalla Super AMOLED, resistencia al agua IP67 y cámara de 50MP.',
       b.id, c.id,
       '{"display": "6.6 pulgadas Super AMOLED", "chip": "Exynos 1480", "camera": "50MP", "battery": "5000mAh"}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'samsung' AND c.slug = 'smartphones';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'A55-128-LIL', 1699.00, '{"storage": "128GB", "color": "Lila"}'::jsonb, true
FROM products p WHERE p.slug = 'galaxy-a55';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://images.samsung.com/is/image/samsung/p6pim/pe/sm-a556ezlelte/gallery/pe-galaxy-a55-5g-sm-a556-sm-a556ezlelte-thumb-539521078', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'galaxy-a55';

-- iPhone 14
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-008', 'iPhone 14', 'iphone-14',
       'iPhone 14 con chip A15 Bionic, sistema de doble cámara avanzado y detección de accidentes.',
       b.id, c.id,
       '{"display": "6.1 pulgadas", "chip": "A15 Bionic", "camera": "12MP dual", "5g": true}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'apple' AND c.slug = 'smartphones';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'IPH14-128-BLU', 3499.00, '{"storage": "128GB", "color": "Azul"}'::jsonb, true
FROM products p WHERE p.slug = 'iphone-14';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch-blue?wid=940&hei=1112&fmt=png-alpha&.v=1661026582221', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'iphone-14';

-- MORE LAPTOPS (3 additional)
-- Dell XPS 15
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-009', 'Dell XPS 15', 'dell-xps-15',
       'Laptop premium con pantalla OLED 3.5K, procesador Intel Core i7 de 13va generación.',
       b.id, c.id,
       '{"display": "15.6 pulgadas OLED 3.5K", "processor": "Intel Core i7-13700H", "ram": "16GB", "storage": "512GB SSD"}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'dell' AND c.slug = 'laptops';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'XPS15-I7-512-SIL', 7499.00, '{"storage": "512GB", "color": "Plata"}'::jsonb, true
FROM products p WHERE p.slug = 'dell-xps-15';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/silver/notebook-xps-15-9530-silver-gallery-1.psd?fmt=png-alpha&wid=600', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'dell-xps-15';

-- Lenovo ThinkPad X1 Carbon
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-010', 'Lenovo ThinkPad X1 Carbon', 'thinkpad-x1-carbon',
       'Ultrabook empresarial con diseño ultraligero, teclado legendario y seguridad empresarial.',
       b.id, c.id,
       '{"display": "14 pulgadas 2.8K OLED", "processor": "Intel Core i7-1365U", "ram": "16GB", "storage": "512GB SSD"}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'lenovo' AND c.slug = 'laptops';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'X1C-I7-512-BLK', 8299.00, '{"storage": "512GB", "color": "Negro"}'::jsonb, true
FROM products p WHERE p.slug = 'thinkpad-x1-carbon';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://p1-ofp.static.pub/fes/cms/2023/11/28/5lnmgv1f4hhvx4vxmrqzqwqwlz2xro934401.png', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'thinkpad-x1-carbon';

-- HP Spectre x360
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-011', 'HP Spectre x360 14', 'hp-spectre-x360',
       'Laptop convertible 2 en 1 con pantalla táctil OLED y diseño elegante en aluminio.',
       b.id, c.id,
       '{"display": "14 pulgadas OLED táctil", "processor": "Intel Core i7-1355U", "ram": "16GB", "storage": "1TB SSD"}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'hp' AND c.slug = 'laptops';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'SPEC360-I7-1TB-BLU', 6999.00, '{"storage": "1TB", "color": "Azul Poseidón"}'::jsonb, true
FROM products p WHERE p.slug = 'hp-spectre-x360';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08520775.png', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'hp-spectre-x360';

-- MORE AUDÍFONOS (3 additional)
-- Apple AirPods Pro 2
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-012', 'Apple AirPods Pro 2', 'airpods-pro-2',
       'Audífonos in-ear con cancelación activa de ruido, audio espacial personalizado y chip H2.',
       b.id, c.id,
       '{"type": "In-ear TWS", "noise_cancelling": true, "battery": "6 horas", "chip": "H2"}'::jsonb,
       true, true
FROM brands b, categories c
WHERE b.slug = 'apple' AND c.slug = 'audifonos';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'APP2-WHT', 1099.00, '{"color": "Blanco"}'::jsonb, true
FROM products p WHERE p.slug = 'airpods-pro-2';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1660803972361', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'airpods-pro-2';

-- Samsung Galaxy Buds2 Pro
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-013', 'Samsung Galaxy Buds2 Pro', 'galaxy-buds2-pro',
       'Audífonos premium con sonido Hi-Fi de 24 bits, ANC inteligente y audio 360.',
       b.id, c.id,
       '{"type": "In-ear TWS", "noise_cancelling": true, "battery": "5 horas", "audio": "24-bit Hi-Fi"}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'samsung' AND c.slug = 'audifonos';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'BUDS2P-GRA', 799.00, '{"color": "Grafito"}'::jsonb, true
FROM products p WHERE p.slug = 'galaxy-buds2-pro';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://images.samsung.com/is/image/samsung/p6pim/pe/2208/gallery/pe-galaxy-buds2-pro-r510-sm-r510nzaalta-thumb-533010037', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'galaxy-buds2-pro';

-- Sony WF-1000XM5
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-014', 'Sony WF-1000XM5', 'sony-wf-1000xm5',
       'Los audífonos in-ear más pequeños del mundo con cancelación de ruido líder en la industria.',
       b.id, c.id,
       '{"type": "In-ear TWS", "noise_cancelling": true, "battery": "8 horas", "ldac": true}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'sony' AND c.slug = 'audifonos';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'WF1000XM5-BLK', 1299.00, '{"color": "Negro"}'::jsonb, true
FROM products p WHERE p.slug = 'sony-wf-1000xm5';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://sony.scene7.com/is/image/sonyglobalsolutions/wf-1000xm5_Primary_image?$categorypdpnav$', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'sony-wf-1000xm5';

-- MORE TELEVISORES (3 additional)
-- LG OLED C3 55"
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-015', 'LG OLED C3 55"', 'lg-oled-c3-55',
       'TV OLED evo con procesador α9 Gen6, Dolby Vision IQ, Dolby Atmos y 4 puertos HDMI 2.1.',
       b.id, c.id,
       '{"size": "55 pulgadas", "resolution": "4K OLED", "panel": "OLED evo", "refresh_rate": "120Hz"}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'lg' AND c.slug = 'televisores';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'LG-C3-55-BLK', 5499.00, '{"model": "OLED55C3PSA"}'::jsonb, true
FROM products p WHERE p.slug = 'lg-oled-c3-55';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://www.lg.com/pe/images/televisores/md07560319/gallery/medium01.jpg', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'lg-oled-c3-55';

-- Sony Bravia XR A80L
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-016', 'Sony Bravia XR A80L 65"', 'sony-bravia-a80l-65',
       'TV OLED con procesador cognitivo XR, Acoustic Surface Audio+ y perfecta para PS5.',
       b.id, c.id,
       '{"size": "65 pulgadas", "resolution": "4K OLED", "panel": "OLED XR", "refresh_rate": "120Hz"}'::jsonb,
       false, true
FROM brands b, categories c
WHERE b.slug = 'sony' AND c.slug = 'televisores';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'A80L-65-BLK', 7999.00, '{"model": "XR-65A80L"}'::jsonb, true
FROM products p WHERE p.slug = 'sony-bravia-a80l-65';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://sony.scene7.com/is/image/sonyglobalsolutions/XR-65A80L_Primary_image?$categorypdpnav$', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'sony-bravia-a80l-65';

-- Samsung Neo QLED 65"
INSERT INTO products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 'PROD-017', 'Samsung Neo QLED 65" QN90C', 'samsung-neo-qled-65',
       'TV Neo QLED con tecnología Quantum Matrix, Neural Quantum Processor y Gaming Hub.',
       b.id, c.id,
       '{"size": "65 pulgadas", "resolution": "4K Neo QLED", "panel": "Neo QLED", "refresh_rate": "144Hz"}'::jsonb,
       true, true
FROM brands b, categories c
WHERE b.slug = 'samsung' AND c.slug = 'televisores';

INSERT INTO variants (product_id, sku, price, attributes, is_active)
SELECT p.id, 'QN90C-65-BLK', 6299.00, '{"model": "QN65QN90C"}'::jsonb, true
FROM products p WHERE p.slug = 'samsung-neo-qled-65';

INSERT INTO images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 'https://images.samsung.com/is/image/samsung/p6pim/pe/qn65qn90cagxpe/gallery/pe-neo-qled-4k-qn90c-qn65qn90cagxpe-536266571?$650_519_PNG$', p.id, NULL, true, 0
FROM products p WHERE p.slug = 'samsung-neo-qled-65';
