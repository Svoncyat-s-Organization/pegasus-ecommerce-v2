-- ============================================
-- SEED DATA: SETTINGS MODULE
-- Repeatable migration (R__) - runs when checksum changes
-- ============================================

-- ============================================
-- BUSINESS INFO (Singleton - id = 1)
-- Información de la empresa Pegasus
-- ============================================
INSERT INTO public.business_info (
    business_name,
    ruc,
    legal_address,
    ubigeo_id,
    phone,
    email,
    website,
    logo_url,
    business_description,
    facebook_url,
    instagram_url,
    twitter_url,
    tiktok_url,
    is_active
) VALUES (
    'Pegasus E-commerce S.A.C.',
    '20123456789',
    'Av. Javier Prado Este 4200, Santiago de Surco',
    '150140',  -- Lima > Lima > Santiago de Surco
    '987654321',
    'contacto@pegasus.pe',
    'https://www.pegasus.pe',
    NULL,
    'Tienda virtual de productos tecnológicos y electrónicos. Ofrecemos la mejor experiencia de compra online en Perú.',
    'https://facebook.com/pegasusperu',
    'https://instagram.com/pegasusperu',
    NULL,
    NULL,
    true
) ON CONFLICT (id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    ruc = EXCLUDED.ruc,
    legal_address = EXCLUDED.legal_address,
    ubigeo_id = EXCLUDED.ubigeo_id,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    logo_url = EXCLUDED.logo_url,
    business_description = EXCLUDED.business_description,
    facebook_url = EXCLUDED.facebook_url,
    instagram_url = EXCLUDED.instagram_url,
    twitter_url = EXCLUDED.twitter_url,
    tiktok_url = EXCLUDED.tiktok_url,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- STOREFRONT SETTINGS (Singleton - id = 1)
-- Configuración de la tienda online
-- ============================================
INSERT INTO public.storefront_settings (
    storefront_name,
    logo_url,
    favicon_url,
    primary_color,
    secondary_color,
    terms_and_conditions,
    privacy_policy,
    return_policy,
    shipping_policy,
    support_email,
    support_phone,
    whatsapp_number,
    is_active
) VALUES (
    'Pegasus E-commerce',
    NULL,
    NULL,
    '#04213b',
    '#f2f2f2',
    'Términos y condiciones de uso de la plataforma Pegasus E-commerce. Al utilizar nuestros servicios, usted acepta estos términos.',
    'Política de privacidad de Pegasus E-commerce. Respetamos su privacidad y protegemos sus datos personales de acuerdo con la ley peruana.',
    'Política de devoluciones: Aceptamos devoluciones dentro de los 7 días posteriores a la recepción del producto, siempre que se encuentre en su empaque original.',
    'Política de envíos: Realizamos envíos a todo el Perú. Los tiempos de entrega varían según la ubicación.',
    'soporte@pegasus.pe',
    '987654321',
    '51987654321',
    true
) ON CONFLICT (id) DO UPDATE SET
    storefront_name = EXCLUDED.storefront_name,
    logo_url = EXCLUDED.logo_url,
    favicon_url = EXCLUDED.favicon_url,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color,
    terms_and_conditions = EXCLUDED.terms_and_conditions,
    privacy_policy = EXCLUDED.privacy_policy,
    return_policy = EXCLUDED.return_policy,
    shipping_policy = EXCLUDED.shipping_policy,
    support_email = EXCLUDED.support_email,
    support_phone = EXCLUDED.support_phone,
    whatsapp_number = EXCLUDED.whatsapp_number,
    updated_at = CURRENT_TIMESTAMP;
