-- ============================================
-- Module: LOCATIONS (Ubigeo - Peru)
-- Tables: ubigeos
-- ============================================

CREATE TABLE public.ubigeos (
    id varchar(6) NOT NULL,
    department_name varchar(50) NOT NULL,
    province_name varchar(50) NOT NULL,
    district_name varchar(50) NOT NULL,
    department_id varchar(2) GENERATED ALWAYS AS (SUBSTRING(id, 1, 2)) STORED,
    province_id varchar(4) GENERATED ALWAYS AS (SUBSTRING(id, 1, 4)) STORED,
    CONSTRAINT ubigeos_pk PRIMARY KEY (id)
);

CREATE INDEX idx_locations_department ON public.ubigeos USING btree (department_id);
CREATE INDEX idx_locations_province ON public.ubigeos USING btree (province_id);
