-- ============================================
-- Migration: Add image columns to storefront_settings and categories
-- V14: Support hero image in storefront and category images
-- ============================================

-- Add hero_image_url to storefront_settings (for home page hero section)
ALTER TABLE public.storefront_settings
ADD COLUMN hero_image_url text;

COMMENT ON COLUMN public.storefront_settings.hero_image_url IS 'URL de la imagen hero para la sección principal del storefront';

-- Add image_url to categories (for category images in storefront)
ALTER TABLE public.categories
ADD COLUMN image_url text;

COMMENT ON COLUMN public.categories.image_url IS 'URL de la imagen de la categoría para mostrar en el storefront';
