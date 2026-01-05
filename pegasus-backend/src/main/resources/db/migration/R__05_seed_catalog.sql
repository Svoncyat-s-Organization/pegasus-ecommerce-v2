-- ===================================================
-- SEED: Catalog Module (Brands, Categories, Products, Variants, Images)
-- Description: Datos de prueba para el catálogo de productos (Tecnología)
-- ===================================================

-- =========================
-- 1. BRANDS (Marcas)
-- =========================
INSERT INTO public.brands (name, slug, image_url, is_active) VALUES
('Apple', 'apple', 'https://placehold.co/200x200/000000/FFFFFF/png?text=Apple', true),
('Samsung', 'samsung', 'https://placehold.co/200x200/1428A0/FFFFFF/png?text=Samsung', true),
('Lenovo', 'lenovo', 'https://placehold.co/200x200/E2231A/FFFFFF/png?text=Lenovo', true),
('HP', 'hp', 'https://placehold.co/200x200/0096D6/FFFFFF/png?text=HP', true),
('Dell', 'dell', 'https://placehold.co/200x200/007DB8/FFFFFF/png?text=Dell', true),
('Xiaomi', 'xiaomi', 'https://placehold.co/200x200/FF6900/FFFFFF/png?text=Xiaomi', true),
('Sony', 'sony', 'https://placehold.co/200x200/000000/FFFFFF/png?text=Sony', true),
('LG', 'lg', 'https://placehold.co/200x200/A50034/FFFFFF/png?text=LG', true),
('Asus', 'asus', 'https://placehold.co/200x200/000000/FFFFFF/png?text=ASUS', true),
('Logitech', 'logitech', 'https://placehold.co/200x200/00B8FC/FFFFFF/png?text=Logitech', true)
ON CONFLICT (slug) DO NOTHING;

-- =========================
-- 2. CATEGORIES (Categorías)
-- =========================

-- Categorías raíz (parent_id = NULL)
INSERT INTO public.categories (name, slug, description, parent_id, is_active) VALUES
('Computadoras', 'computadoras', 'Laptops, PCs de escritorio y accesorios', NULL, true),
('Celulares', 'celulares', 'Smartphones y accesorios móviles', NULL, true),
('Audio', 'audio', 'Auriculares, parlantes y equipos de sonido', NULL, true),
('Gaming', 'gaming', 'Consolas, periféricos y accesorios gaming', NULL, true),
('Accesorios', 'accesorios', 'Periféricos y complementos tecnológicos', NULL, true)
ON CONFLICT (slug) DO NOTHING;

-- Subcategorías (parent_id referencia a categorías raíz)
-- Nota: Los IDs se obtienen dinámicamente
INSERT INTO public.categories (name, slug, description, parent_id, is_active)
SELECT 'Laptops', 'laptops', 'Computadoras portátiles', c.id, true
FROM public.categories c WHERE c.slug = 'computadoras'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, description, parent_id, is_active)
SELECT 'PCs de Escritorio', 'pcs-escritorio', 'Computadoras de escritorio', c.id, true
FROM public.categories c WHERE c.slug = 'computadoras'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, description, parent_id, is_active)
SELECT 'Smartphones', 'smartphones', 'Teléfonos inteligentes', c.id, true
FROM public.categories c WHERE c.slug = 'celulares'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, description, parent_id, is_active)
SELECT 'Auriculares', 'auriculares', 'Audífonos y auriculares', c.id, true
FROM public.categories c WHERE c.slug = 'audio'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, description, parent_id, is_active)
SELECT 'Teclados', 'teclados', 'Teclados mecánicos y membranas', c.id, true
FROM public.categories c WHERE c.slug = 'accesorios'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, description, parent_id, is_active)
SELECT 'Mouses', 'mouses', 'Ratones ópticos y láser', c.id, true
FROM public.categories c WHERE c.slug = 'accesorios'
ON CONFLICT (slug) DO NOTHING;

-- =========================
-- 3. PRODUCTS (Productos)
-- =========================

-- Laptops
INSERT INTO public.products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 
    'LAP-MBA-M2-001',
    'MacBook Air M2 2023',
    'macbook-air-m2-2023',
    'Laptop ultraligera con chip M2, pantalla Liquid Retina de 13.6", ideal para productividad y entretenimiento',
    b.id,
    c.id,
    '{"processor": "Apple M2", "ram": "8GB", "storage": "256GB SSD", "screen": "13.6 pulgadas", "os": "macOS Ventura"}'::jsonb,
    true,
    true
FROM public.brands b, public.categories c
WHERE b.slug = 'apple' AND c.slug = 'laptops'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 
    'LAP-LEN-IP5-002',
    'Lenovo IdeaPad 5 Gen 7',
    'lenovo-ideapad-5-gen7',
    'Laptop versátil con procesador AMD Ryzen 5, perfecta para trabajo y estudio',
    b.id,
    c.id,
    '{"processor": "AMD Ryzen 5 5500U", "ram": "16GB DDR4", "storage": "512GB SSD", "screen": "15.6 pulgadas FHD", "os": "Windows 11 Home"}'::jsonb,
    true,
    true
FROM public.brands b, public.categories c
WHERE b.slug = 'lenovo' AND c.slug = 'laptops'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 
    'LAP-HP-PAV-003',
    'HP Pavilion Gaming 15',
    'hp-pavilion-gaming-15',
    'Laptop gaming con gráficos NVIDIA GTX 1650, diseño agresivo y alto rendimiento',
    b.id,
    c.id,
    '{"processor": "Intel Core i5-11300H", "ram": "8GB DDR4", "storage": "512GB SSD", "screen": "15.6 pulgadas FHD 144Hz", "gpu": "NVIDIA GTX 1650 4GB", "os": "Windows 11 Home"}'::jsonb,
    false,
    true
FROM public.brands b, public.categories c
WHERE b.slug = 'hp' AND c.slug = 'laptops'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 
    'LAP-DEL-XPS-004',
    'Dell XPS 13 Plus',
    'dell-xps-13-plus',
    'Laptop premium con diseño minimalista, pantalla InfinityEdge y rendimiento excepcional',
    b.id,
    c.id,
    '{"processor": "Intel Core i7-1260P", "ram": "16GB LPDDR5", "storage": "512GB SSD", "screen": "13.4 pulgadas FHD+", "os": "Windows 11 Pro"}'::jsonb,
    true,
    true
FROM public.brands b, public.categories c
WHERE b.slug = 'dell' AND c.slug = 'laptops'
ON CONFLICT (code) DO NOTHING;

-- Smartphones
INSERT INTO public.products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 
    'CEL-IPH-15P-005',
    'iPhone 15 Pro Max',
    'iphone-15-pro-max',
    'Smartphone de gama alta con chip A17 Pro, cámara de 48MP y titanio aeroespacial',
    b.id,
    c.id,
    '{"processor": "Apple A17 Pro", "ram": "8GB", "storage": "256GB", "screen": "6.7 pulgadas Super Retina XDR", "camera": "48MP + 12MP + 12MP", "battery": "4422mAh"}'::jsonb,
    true,
    true
FROM public.brands b, public.categories c
WHERE b.slug = 'apple' AND c.slug = 'smartphones'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 
    'CEL-SAM-S24-006',
    'Samsung Galaxy S24 Ultra',
    'samsung-galaxy-s24-ultra',
    'Flagship con S Pen integrado, cámara de 200MP y pantalla Dynamic AMOLED 2X',
    b.id,
    c.id,
    '{"processor": "Snapdragon 8 Gen 3", "ram": "12GB", "storage": "512GB", "screen": "6.8 pulgadas QHD+", "camera": "200MP + 50MP + 12MP + 10MP", "battery": "5000mAh"}'::jsonb,
    true,
    true
FROM public.brands b, public.categories c
WHERE b.slug = 'samsung' AND c.slug = 'smartphones'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 
    'CEL-XIA-14P-007',
    'Xiaomi 14 Pro',
    'xiaomi-14-pro',
    'Smartphone con cámara Leica, carga rápida de 120W y pantalla LTPO AMOLED',
    b.id,
    c.id,
    '{"processor": "Snapdragon 8 Gen 3", "ram": "12GB", "storage": "256GB", "screen": "6.73 pulgadas LTPO AMOLED", "camera": "50MP Leica + 50MP + 50MP", "battery": "4880mAh"}'::jsonb,
    false,
    true
FROM public.brands b, public.categories c
WHERE b.slug = 'xiaomi' AND c.slug = 'smartphones'
ON CONFLICT (code) DO NOTHING;

-- Auriculares
INSERT INTO public.products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 
    'AUD-APP-MAX-008',
    'AirPods Max',
    'airpods-max',
    'Auriculares over-ear con cancelación activa de ruido, audio espacial y diseño premium',
    b.id,
    c.id,
    '{"type": "Over-Ear", "connectivity": "Bluetooth 5.0", "anc": "Sí", "battery": "20 horas", "spatial_audio": "Sí"}'::jsonb,
    true,
    true
FROM public.brands b, public.categories c
WHERE b.slug = 'apple' AND c.slug = 'auriculares'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 
    'AUD-SON-XM5-009',
    'Sony WH-1000XM5',
    'sony-wh-1000xm5',
    'Auriculares inalámbricos líderes en cancelación de ruido, comodidad excepcional',
    b.id,
    c.id,
    '{"type": "Over-Ear", "connectivity": "Bluetooth 5.2", "anc": "Sí", "battery": "30 horas", "ldac": "Sí"}'::jsonb,
    true,
    true
FROM public.brands b, public.categories c
WHERE b.slug = 'sony' AND c.slug = 'auriculares'
ON CONFLICT (code) DO NOTHING;

-- Teclados
INSERT INTO public.products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 
    'ACC-LOG-G915-010',
    'Logitech G915 TKL',
    'logitech-g915-tkl',
    'Teclado mecánico gaming inalámbrico con switches GL, RGB LIGHTSYNC y diseño TKL',
    b.id,
    c.id,
    '{"type": "Mecánico", "switches": "GL Tactile", "connectivity": "LIGHTSPEED Wireless", "backlight": "RGB LIGHTSYNC", "battery": "40 horas"}'::jsonb,
    false,
    true
FROM public.brands b, public.categories c
WHERE b.slug = 'logitech' AND c.slug = 'teclados'
ON CONFLICT (code) DO NOTHING;

-- Mouses
INSERT INTO public.products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 
    'ACC-LOG-GPRO-011',
    'Logitech G Pro X Superlight',
    'logitech-gpro-x-superlight',
    'Mouse gaming ultraligero (63g) con sensor HERO 25K, ideal para esports',
    b.id,
    c.id,
    '{"type": "Gaming", "sensor": "HERO 25K", "dpi": "100-25600", "weight": "63g", "connectivity": "LIGHTSPEED Wireless", "battery": "70 horas"}'::jsonb,
    false,
    true
FROM public.brands b, public.categories c
WHERE b.slug = 'logitech' AND c.slug = 'mouses'
ON CONFLICT (code) DO NOTHING;

-- PCs de Escritorio
INSERT INTO public.products (code, name, slug, description, brand_id, category_id, specs, is_featured, is_active)
SELECT 
    'PC-HP-OMN-012',
    'HP OMEN 40L Gaming Desktop',
    'hp-omen-40l-desktop',
    'PC gaming prearmado con RTX 4070 Ti, procesador Intel i7 y refrigeración líquida',
    b.id,
    c.id,
    '{"processor": "Intel Core i7-13700K", "ram": "32GB DDR5", "storage": "1TB SSD + 2TB HDD", "gpu": "NVIDIA RTX 4070 Ti 12GB", "cooling": "Líquida", "os": "Windows 11 Pro"}'::jsonb,
    false,
    true
FROM public.brands b, public.categories c
WHERE b.slug = 'hp' AND c.slug = 'pcs-escritorio'
ON CONFLICT (code) DO NOTHING;

-- =========================
-- 4. VARIANTS (Variantes de productos)
-- =========================

-- MacBook Air M2 - Variantes por color y almacenamiento
INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'MBA-M2-256-MIDNIGHT',
    4999.00,
    '{"color": "Midnight", "storage": "256GB", "ram": "8GB"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'LAP-MBA-M2-001'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'MBA-M2-512-STARLIGHT',
    5499.00,
    '{"color": "Starlight", "storage": "512GB", "ram": "8GB"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'LAP-MBA-M2-001'
ON CONFLICT (sku) DO NOTHING;

-- Lenovo IdeaPad 5 - Variantes por RAM
INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'IP5-GEN7-16GB-512',
    2799.00,
    '{"color": "Storm Grey", "storage": "512GB", "ram": "16GB"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'LAP-LEN-IP5-002'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'IP5-GEN7-8GB-512',
    2499.00,
    '{"color": "Storm Grey", "storage": "512GB", "ram": "8GB"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'LAP-LEN-IP5-002'
ON CONFLICT (sku) DO NOTHING;

-- HP Pavilion Gaming - Una sola variante
INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'HP-PAV15-GTX1650-8GB',
    3299.00,
    '{"color": "Shadow Black", "storage": "512GB", "ram": "8GB", "gpu": "GTX 1650"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'LAP-HP-PAV-003'
ON CONFLICT (sku) DO NOTHING;

-- Dell XPS 13 Plus - Variantes por almacenamiento
INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'XPS13-PLUS-512-16GB',
    5999.00,
    '{"color": "Platinum", "storage": "512GB", "ram": "16GB"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'LAP-DEL-XPS-004'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'XPS13-PLUS-1TB-32GB',
    7499.00,
    '{"color": "Graphite", "storage": "1TB", "ram": "32GB"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'LAP-DEL-XPS-004'
ON CONFLICT (sku) DO NOTHING;

-- iPhone 15 Pro Max - Variantes por color y almacenamiento
INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'IPH15PM-256-TITANIUM-NATURAL',
    5699.00,
    '{"color": "Natural Titanium", "storage": "256GB"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'CEL-IPH-15P-005'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'IPH15PM-512-TITANIUM-BLACK',
    6399.00,
    '{"color": "Black Titanium", "storage": "512GB"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'CEL-IPH-15P-005'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'IPH15PM-1TB-TITANIUM-BLUE',
    7299.00,
    '{"color": "Blue Titanium", "storage": "1TB"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'CEL-IPH-15P-005'
ON CONFLICT (sku) DO NOTHING;

-- Samsung Galaxy S24 Ultra - Variantes por color
INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'S24U-512-TITANIUM-GRAY',
    5299.00,
    '{"color": "Titanium Gray", "storage": "512GB", "ram": "12GB"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'CEL-SAM-S24-006'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'S24U-1TB-TITANIUM-VIOLET',
    6199.00,
    '{"color": "Titanium Violet", "storage": "1TB", "ram": "12GB"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'CEL-SAM-S24-006'
ON CONFLICT (sku) DO NOTHING;

-- Xiaomi 14 Pro - Variantes por color
INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'XIA14P-256-BLACK',
    3499.00,
    '{"color": "Black", "storage": "256GB", "ram": "12GB"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'CEL-XIA-14P-007'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'XIA14P-512-WHITE',
    3999.00,
    '{"color": "White", "storage": "512GB", "ram": "12GB"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'CEL-XIA-14P-007'
ON CONFLICT (sku) DO NOTHING;

-- AirPods Max - Variantes por color
INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'APM-SILVER',
    2399.00,
    '{"color": "Silver"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'AUD-APP-MAX-008'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'APM-SPACE-GRAY',
    2399.00,
    '{"color": "Space Gray"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'AUD-APP-MAX-008'
ON CONFLICT (sku) DO NOTHING;

-- Sony WH-1000XM5 - Variantes por color
INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'XM5-BLACK',
    1499.00,
    '{"color": "Black"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'AUD-SON-XM5-009'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'XM5-SILVER',
    1499.00,
    '{"color": "Silver"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'AUD-SON-XM5-009'
ON CONFLICT (sku) DO NOTHING;

-- Logitech G915 TKL - Variantes por switches
INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'G915TKL-TACTILE',
    899.00,
    '{"switches": "GL Tactile", "color": "Black"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'ACC-LOG-G915-010'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'G915TKL-LINEAR',
    899.00,
    '{"switches": "GL Linear", "color": "Black"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'ACC-LOG-G915-010'
ON CONFLICT (sku) DO NOTHING;

-- Logitech G Pro X Superlight - Variantes por color
INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'GPROX-SL-BLACK',
    649.00,
    '{"color": "Black"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'ACC-LOG-GPRO-011'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'GPROX-SL-WHITE',
    649.00,
    '{"color": "White"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'ACC-LOG-GPRO-011'
ON CONFLICT (sku) DO NOTHING;

-- HP OMEN 40L Desktop - Una sola variante
INSERT INTO public.variants (product_id, sku, price, attributes, is_active)
SELECT 
    p.id,
    'OMEN40L-I7-RTX4070TI',
    8999.00,
    '{"processor": "i7-13700K", "gpu": "RTX 4070 Ti", "ram": "32GB", "storage": "1TB SSD + 2TB HDD"}'::jsonb,
    true
FROM public.products p WHERE p.code = 'PC-HP-OMN-012'
ON CONFLICT (sku) DO NOTHING;

-- =========================
-- 5. IMAGES (Imágenes de productos)
-- =========================

-- MacBook Air M2
INSERT INTO public.images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 
    'https://placehold.co/800x600/E5E5EA/000000/png?text=MacBook+Air+M2',
    p.id,
    NULL,
    true,
    0
FROM public.products p WHERE p.code = 'LAP-MBA-M2-001'
ON CONFLICT DO NOTHING;

INSERT INTO public.images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 
    'https://placehold.co/800x600/E5E5EA/000000/png?text=MacBook+Air+Side',
    p.id,
    NULL,
    false,
    1
FROM public.products p WHERE p.code = 'LAP-MBA-M2-001';

-- Lenovo IdeaPad 5
INSERT INTO public.images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 
    'https://placehold.co/800x600/E2231A/FFFFFF/png?text=Lenovo+IdeaPad+5',
    p.id,
    NULL,
    true,
    0
FROM public.products p WHERE p.code = 'LAP-LEN-IP5-002';

-- HP Pavilion Gaming
INSERT INTO public.images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 
    'https://placehold.co/800x600/0096D6/FFFFFF/png?text=HP+Pavilion+Gaming',
    p.id,
    NULL,
    true,
    0
FROM public.products p WHERE p.code = 'LAP-HP-PAV-003';

-- Dell XPS 13 Plus
INSERT INTO public.images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 
    'https://placehold.co/800x600/007DB8/FFFFFF/png?text=Dell+XPS+13+Plus',
    p.id,
    NULL,
    true,
    0
FROM public.products p WHERE p.code = 'LAP-DEL-XPS-004';

-- iPhone 15 Pro Max
INSERT INTO public.images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 
    'https://placehold.co/800x600/000000/FFFFFF/png?text=iPhone+15+Pro+Max',
    p.id,
    NULL,
    true,
    0
FROM public.products p WHERE p.code = 'CEL-IPH-15P-005';

INSERT INTO public.images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 
    'https://placehold.co/800x600/000000/FFFFFF/png?text=iPhone+15+Camera',
    p.id,
    NULL,
    false,
    1
FROM public.products p WHERE p.code = 'CEL-IPH-15P-005';

-- Samsung Galaxy S24 Ultra
INSERT INTO public.images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 
    'https://placehold.co/800x600/1428A0/FFFFFF/png?text=Galaxy+S24+Ultra',
    p.id,
    NULL,
    true,
    0
FROM public.products p WHERE p.code = 'CEL-SAM-S24-006';

-- Xiaomi 14 Pro
INSERT INTO public.images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 
    'https://placehold.co/800x600/FF6900/FFFFFF/png?text=Xiaomi+14+Pro',
    p.id,
    NULL,
    true,
    0
FROM public.products p WHERE p.code = 'CEL-XIA-14P-007';

-- AirPods Max
INSERT INTO public.images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 
    'https://placehold.co/800x600/000000/FFFFFF/png?text=AirPods+Max',
    p.id,
    NULL,
    true,
    0
FROM public.products p WHERE p.code = 'AUD-APP-MAX-008';

-- Sony WH-1000XM5
INSERT INTO public.images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 
    'https://placehold.co/800x600/000000/FFFFFF/png?text=Sony+XM5',
    p.id,
    NULL,
    true,
    0
FROM public.products p WHERE p.code = 'AUD-SON-XM5-009';

-- Logitech G915 TKL
INSERT INTO public.images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 
    'https://placehold.co/800x600/00B8FC/FFFFFF/png?text=Logitech+G915+TKL',
    p.id,
    NULL,
    true,
    0
FROM public.products p WHERE p.code = 'ACC-LOG-G915-010';

-- Logitech G Pro X Superlight
INSERT INTO public.images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 
    'https://placehold.co/800x600/00B8FC/FFFFFF/png?text=Logitech+GPro+X',
    p.id,
    NULL,
    true,
    0
FROM public.products p WHERE p.code = 'ACC-LOG-GPRO-011';

-- HP OMEN 40L
INSERT INTO public.images (image_url, product_id, variant_id, is_primary, display_order)
SELECT 
    'https://placehold.co/800x600/0096D6/FFFFFF/png?text=HP+OMEN+40L',
    p.id,
    NULL,
    true,
    0
FROM public.products p WHERE p.code = 'PC-HP-OMN-012';

-- ===================================================
-- END: Catalog Seed
-- Total: 10 brands, 11 categories, 12 products, 24 variants, 15 images
-- ===================================================
