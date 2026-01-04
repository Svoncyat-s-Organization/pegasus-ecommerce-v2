-- Fix doc_type column to use VARCHAR instead of custom enum type
-- This improves compatibility with Hibernate @Enumerated(EnumType.STRING)

-- Modify users table
ALTER TABLE public.users 
    ALTER COLUMN doc_type TYPE VARCHAR(3) USING doc_type::text;

ALTER TABLE public.users 
    ADD CONSTRAINT users_doc_type_check CHECK (doc_type IN ('DNI', 'CE'));

-- Modify customers table
ALTER TABLE public.customers 
    ALTER COLUMN doc_type TYPE VARCHAR(3) USING doc_type::text;

ALTER TABLE public.customers 
    ADD CONSTRAINT customers_doc_type_check CHECK (doc_type IN ('DNI', 'CE'));

-- Drop the enum type (no longer needed)
DROP TYPE IF EXISTS public.document_type_enum CASCADE;
