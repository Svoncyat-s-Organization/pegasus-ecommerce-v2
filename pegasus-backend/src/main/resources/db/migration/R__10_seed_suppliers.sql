-- Only the project lead should create migrations. Team members: propose changes in PR descriptions with SQL suggestions.

-- ============================================
-- Seed: SUPPLIERS (Repeatable)
-- Purpose: Initial suppliers for Purchases module
-- Idempotency: UPSERT by unique doc_number (NO DELETE to avoid FK issues with purchases)
-- ============================================

INSERT INTO public.suppliers (
    doc_type,
    doc_number,
    company_name,
    contact_name,
    phone,
    email,
    address,
    ubigeo_id,
    is_active
)
VALUES
    (
        'RUC',
        '20123456789',
        'Distribuidora Andina S.A.C.',
        'María Salazar',
        '987654321',
        'contacto@andina.pe',
        'Av. Industrial 123, Lima',
                (SELECT id
                 FROM public.ubigeos
                 WHERE UPPER(department_name) = 'LIMA'
                     AND UPPER(province_name) = 'LIMA'
                     AND UPPER(district_name) = 'LIMA'
                 ORDER BY id
                 LIMIT 1),
        true
    ),
    (
        'RUC',
        '20456789012',
        'Comercial San Martín E.I.R.L.',
        'Jorge Ramírez',
        '912345678',
        'ventas@sanmartin.pe',
        'Jr. Comercio 456, Trujillo',
                (SELECT id
                 FROM public.ubigeos
                 WHERE UPPER(department_name) = 'LA LIBERTAD'
                     AND UPPER(province_name) = 'TRUJILLO'
                     AND UPPER(district_name) = 'TRUJILLO'
                 ORDER BY id
                 LIMIT 1),
        true
    ),
    (
        'RUC',
        '20678901234',
        'Importaciones Pacífico S.R.L.',
        'Ana Torres',
        '923456789',
        'proveedores@pacifico.pe',
        'Calle Los Puertos 789, Callao',
                (SELECT id
                 FROM public.ubigeos
                 WHERE UPPER(department_name) = 'CALLAO'
                     AND UPPER(province_name) = 'CALLAO'
                     AND UPPER(district_name) = 'CALLAO'
                 ORDER BY id
                 LIMIT 1),
        true
    )
ON CONFLICT (doc_number)
DO UPDATE SET
    doc_type = EXCLUDED.doc_type,
    company_name = EXCLUDED.company_name,
    contact_name = EXCLUDED.contact_name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    ubigeo_id = EXCLUDED.ubigeo_id,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;
