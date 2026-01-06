-- Allow Storefront (Customer) actions without forcing a backoffice user FK.
-- This prevents FK violations when creating/cancelling orders from Storefront.

-- 1) order_status_histories.created_by: allow NULL and keep FK (NULLs are allowed)
ALTER TABLE public.order_status_histories
    ALTER COLUMN created_by DROP NOT NULL;

-- Recreate FK with ON DELETE SET NULL (optional but safer for audit history)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_user_fk') THEN
        ALTER TABLE public.order_status_histories DROP CONSTRAINT orders_user_fk;
    END IF;

    ALTER TABLE public.order_status_histories
        ADD CONSTRAINT orders_user_fk FOREIGN KEY (created_by)
        REFERENCES public.users (id)
        ON DELETE SET NULL;
END $$;

-- 2) movements.user_id: allow NULL and keep FK (NULLs are allowed)
ALTER TABLE public.movements
    ALTER COLUMN user_id DROP NOT NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'movements_user_fk') THEN
        ALTER TABLE public.movements DROP CONSTRAINT movements_user_fk;
    END IF;

    ALTER TABLE public.movements
        ADD CONSTRAINT movements_user_fk FOREIGN KEY (user_id)
        REFERENCES public.users (id)
        ON DELETE SET NULL;
END $$;
