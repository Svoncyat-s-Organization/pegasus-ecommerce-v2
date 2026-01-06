-- ============================================
-- Fix: RMA status constraints alignment
-- Reason: Backend enum (RmaStatus) uses IN_TRANSIT/INSPECTING/REFUNDED/CLOSED, but initial schema CHECKs used PROCESSING/COMPLETED.
-- This migration updates CHECK constraints to match application flow.
-- ============================================

ALTER TABLE public.rma_status_histories
    DROP CONSTRAINT IF EXISTS rma_status_histories_status_check;

ALTER TABLE public.rma_status_histories
    ADD CONSTRAINT rma_status_histories_status_check CHECK (status IN (
        'PENDING', 'APPROVED', 'REJECTED',
        'IN_TRANSIT', 'RECEIVED', 'INSPECTING',
        'REFUNDED', 'CLOSED', 'CANCELLED'
    ));

ALTER TABLE public.rmas
    DROP CONSTRAINT IF EXISTS rmas_status_check;

ALTER TABLE public.rmas
    ADD CONSTRAINT rmas_status_check CHECK (status IN (
        'PENDING', 'APPROVED', 'REJECTED',
        'IN_TRANSIT', 'RECEIVED', 'INSPECTING',
        'REFUNDED', 'CLOSED', 'CANCELLED'
    ));
