-- ============================================
-- Module: RBAC (Role-Based Access Control)
-- Tables: users, roles, modules, roles_modules, roles_users
-- ============================================

CREATE TABLE public.users (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    username varchar(50) NOT NULL,
    email varchar(255) NOT NULL,
    password_hash varchar(255) NOT NULL,
    doc_type varchar(10) NOT NULL,
    doc_number varchar(20) NOT NULL,
    first_name varchar(100) NOT NULL,
    last_name varchar(100) NOT NULL,
    phone varchar(20),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pk PRIMARY KEY (id),
    CONSTRAINT users_email_uq UNIQUE (email),
    CONSTRAINT users_username_uq UNIQUE (username),
    CONSTRAINT users_doc_number_uq UNIQUE (doc_number),
    CONSTRAINT users_doc_type_check CHECK (doc_type IN ('DNI', 'CE'))
);
COMMENT ON COLUMN public.users.doc_type IS 'Tipo de documento: DNI, CE';

CREATE TABLE public.roles (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    name varchar(50) NOT NULL,
    description varchar(255),
    CONSTRAINT roles_pk PRIMARY KEY (id),
    CONSTRAINT roles_name_uq UNIQUE (name)
);

CREATE TABLE public.modules (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    icon varchar(50),
    name varchar(50) NOT NULL,
    path varchar(100) NOT NULL,
    CONSTRAINT modules_pk PRIMARY KEY (id)
);

CREATE TABLE public.roles_modules (
    id_roles bigint NOT NULL,
    id_modules bigint NOT NULL,
    CONSTRAINT roles_modules_pk PRIMARY KEY (id_roles, id_modules),
    CONSTRAINT roles_modules_roles_fk FOREIGN KEY (id_roles)
        REFERENCES public.roles (id) MATCH FULL
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT roles_modules_modules_fk FOREIGN KEY (id_modules)
        REFERENCES public.modules (id) MATCH FULL
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE public.roles_users (
    id_roles bigint NOT NULL,
    id_users bigint NOT NULL,
    CONSTRAINT roles_users_pk PRIMARY KEY (id_roles, id_users),
    CONSTRAINT roles_users_roles_fk FOREIGN KEY (id_roles)
        REFERENCES public.roles (id) MATCH FULL
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT roles_users_users_fk FOREIGN KEY (id_users)
        REFERENCES public.users (id) MATCH FULL
        ON DELETE RESTRICT ON UPDATE CASCADE
);
