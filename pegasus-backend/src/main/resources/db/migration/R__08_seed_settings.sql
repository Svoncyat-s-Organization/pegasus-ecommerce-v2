-- ============================================
-- Seed: Settings (Business Info and Storefront)
-- Note: Single-row configuration tables
-- ============================================

-- Business Info (singleton pattern with id=1)
DELETE FROM business_info;

INSERT INTO business_info (
    id, business_name, ruc, legal_address, ubigeo_id, phone, email,
    website, logo_url, business_description,
    facebook_url, instagram_url, twitter_url, tiktok_url,
    is_active
) OVERRIDING SYSTEM VALUE VALUES (
    1,
    'Pegasus E-commerce S.A.C.',
    '20123456789',
    'Av. Javier Prado Este 1234, San Isidro',
    '150131',
    '(01) 555-1234',
    'contacto@pegasus.com.pe',
    'https://pegasus.com.pe',
    'https://placehold.co/400x100?text=Pegasus+Logo',
    'Tu tienda de tecnología favorita en Perú. Ofrecemos los mejores productos electrónicos con garantía y servicio de calidad.',
    'https://facebook.com/pegasus.pe',
    'https://instagram.com/pegasus.pe',
    'https://twitter.com/pegasus_pe',
    'https://tiktok.com/@pegasus.pe',
    true
);

-- Reset sequence for business_info
SELECT setval(pg_get_serial_sequence('business_info', 'id'), 1, true);

-- Storefront Settings (singleton pattern with id=1)
DELETE FROM storefront_settings;

INSERT INTO storefront_settings (
    id, storefront_name, logo_url, favicon_url,
    primary_color, secondary_color,
    terms_and_conditions, privacy_policy, return_policy, shipping_policy,
    support_email, support_phone, whatsapp_number,
    is_active
) OVERRIDING SYSTEM VALUE VALUES (
    1,
    'Pegasus',
    'https://placehold.co/200x50?text=Pegasus',
    'https://placehold.co/32x32?text=P',
    '#04213b',
    '#f2f2f2',
    'Términos y condiciones de uso de la plataforma Pegasus...',
    'Política de privacidad y tratamiento de datos personales...',
    'Política de devoluciones: Tienes 30 días para devolver tu producto...',
    'Política de envíos: Envíos a todo el Perú...',
    'soporte@pegasus.com.pe',
    '(01) 555-1234',
    '51999888777',
    true
);

-- Reset sequence for storefront_settings
SELECT setval(pg_get_serial_sequence('storefront_settings', 'id'), 1, true);
