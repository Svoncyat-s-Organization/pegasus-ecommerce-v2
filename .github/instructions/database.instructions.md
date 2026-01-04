---
applyTo: "pegasus-backend/src/main/resources/db/**/*.sql"
---

# Database Context: PostgreSQL + Flyway

## CRITICAL RULES (Read First)

**Peru Validations:** See `copilot-instructions.md` for DNI/CE/Ubigeo/Currency rules.

**Flyway Naming (MANDATORY):**
- Versioned migrations: `V{N}__{description}.sql` (two underscores)
- Repeatable migrations: `R__{description}.sql` (for seeds/data)
- NEVER modify executed V__ migrations (creates checksum mismatch)

**Schema Reference File (MANDATORY):**
- File: `pegasus_v2_db.sql` (root of `/db/` folder)
- Purpose: Reflects the CURRENT state of the database schema (all migrations applied)
- Rule: After creating ANY migration in `/migration/`, UPDATE `pegasus_v2_db.sql` to match
- This file is NEVER executed by Flyway - it is documentation for the team

**Quality:** SQL MUST be valid PostgreSQL syntax. Test with `\i filename.sql` if unsure.

---

## 1. Conventions

### Naming

| Element | Convention | Example |
|---------|------------|---------|
| Tables | `snake_case`, plural | `orders`, `order_items` |
| Columns | `snake_case` | `created_at`, `unit_price` |
| Primary Keys | `id` (always) | `id bigint` |
| Foreign Keys | `{table_singular}_id` | `customer_id`, `product_id` |
| Indexes | `idx_{table}_{column(s)}` | `idx_orders_customer` |
| Constraints | `{table}_{type}` or `{table}_{column}_{type}` | `orders_pk`, `users_email_uq` |
| Enums | `{name}_enum` (if using TYPE) | `order_status_enum` |

### Data Types (MANDATORY)

| Use Case | PostgreSQL Type | Notes |
|----------|-----------------|-------|
| Primary Keys | `bigint GENERATED ALWAYS AS IDENTITY` | Auto-increment, no gaps |
| Money | `NUMERIC(12, 2)` | NEVER use float/double |
| Timestamps | `timestamptz` | Always with timezone |
| Booleans | `boolean` | Default `true` or `false` |
| JSON data | `jsonb` | With GIN index for search |
| Ubigeo FK | `varchar(6)` | References `ubigeos(id)` |
| Short codes | `varchar(50)` | SKU, order_number, codes |
| Emails | `varchar(255)` | With lowercase index |
| Phone | `varchar(20)` | Store plain 9 digits only |
| Descriptions | `text` | Unlimited length |

---

## 2. Table Structure Pattern

**Standard Table Template:**
```sql
CREATE TABLE public.{table_name} (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    -- business columns here
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT {table_name}_pk PRIMARY KEY (id)
);
```

**Mandatory Audit Columns (for main entities):**
- `is_active boolean NOT NULL DEFAULT true` - Soft delete support
- `created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP`

**Exceptions (NO audit columns):**
- Junction tables (`roles_users`, `roles_modules`)
- History/log tables (only `created_at`)
- Reference data (ubigeos, static lookups)

---

## 3. Foreign Keys

**ON DELETE Rules:**
- `CASCADE`: Child records deleted with parent (order_items when order deleted)
- `RESTRICT`: Prevent deletion if children exist (products with orders)
- `SET NULL`: Set FK to null (category parent_id)
- `NO ACTION`: Same as RESTRICT (default, explicit is better)

**ON UPDATE:** Always `CASCADE` unless specific reason.

**Pattern:**
```sql
ALTER TABLE public.{child_table} ADD CONSTRAINT {child}_{parent}_fk 
FOREIGN KEY ({parent}_id)
REFERENCES public.{parent_table} (id) MATCH SIMPLE
ON DELETE {RULE} ON UPDATE CASCADE;
```

---

## 4. Indexes

**Create indexes for:**
- Foreign key columns (PostgreSQL does NOT auto-index FKs)
- Columns used in WHERE clauses frequently
- Columns used in ORDER BY
- JSONB columns with GIN for search

**JSONB Index Pattern:**
```sql
CREATE INDEX idx_{table}_{column} ON public.{table}
USING gin ({column});
```

**Composite Index Pattern:**
```sql
CREATE INDEX idx_{table}_{col1}_{col2} ON public.{table}
USING btree ({col1}, {col2});
```

**Unique Partial Index (for single default flag):**
```sql
CREATE UNIQUE INDEX idx_{table}_default_uq ON public.{table}
USING btree ({parent}_id)
WHERE (is_default = TRUE);
```

---

## 5. Enums vs CHECK Constraints

**Prefer VARCHAR + CHECK over ENUM TYPE:**
```sql
-- PREFERRED: Easier to modify
doc_type VARCHAR(3) NOT NULL,
CONSTRAINT users_doc_type_check CHECK (doc_type IN ('DNI', 'CE'))

-- AVOID: Harder to add/remove values
doc_type document_type_enum NOT NULL
```

**Exception:** Use ENUM TYPE for status columns with many values that rarely change:
```sql
CREATE TYPE public.order_status_enum AS
ENUM ('PENDING','AWAIT_PAYMENT','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED');
```

---

## 6. Repeatable Migrations (Seeds)

**Rules for R__ files:**
- MUST be idempotent (can run multiple times safely)
- ALWAYS start with DELETE for the data being inserted
- Use specific WHERE clauses, not TRUNCATE

**Pattern:**
```sql
-- Clear specific seed data (NOT all data)
DELETE FROM {table} WHERE {identifying_condition};

-- Insert seed data
INSERT INTO {table} (col1, col2, ...)
VALUES 
    ('value1', 'value2', ...),
    ('value3', 'value4', ...);
```

---

## 7. Peru-Specific Patterns

### Ubigeo Reference
```sql
ubigeo_id varchar(6) NOT NULL,
CONSTRAINT {table}_ubigeo_fk FOREIGN KEY (ubigeo_id)
    REFERENCES public.ubigeos (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
```

### Document Validation
```sql
doc_type varchar(3) NOT NULL,
doc_number varchar(20) NOT NULL,
CONSTRAINT {table}_doc_type_check CHECK (doc_type IN ('DNI', 'CE')),
CONSTRAINT {table}_doc_number_uq UNIQUE (doc_number)
```

### Phone Storage
```sql
phone varchar(20)  -- Store plain: '987654321' (9 digits, no +51, no spaces)
```

### Money Columns
```sql
unit_price numeric(12,2) NOT NULL,
total numeric(12,2) NOT NULL,
CONSTRAINT check_{column}_positive CHECK ({column} >= 0)
```

---

## 8. JSONB Usage

**When to use JSONB:**
- Variable attributes (product specs, variant attributes)
- Snapshot data (shipping_address in orders - captures address at time of order)
- Flexible metadata

**When NOT to use JSONB:**
- Data that needs to be queried frequently with JOINs
- Data with strict schema requirements
- Foreign key relationships

**Pattern with snapshot:**
```sql
-- Orders stores address snapshot (not FK) because address may change later
shipping_address jsonb NOT NULL,
billing_address jsonb
```

---

## 9. Module Patterns (MVP)

### Existing Modules (Reference)

| Module | Main Tables | Notes |
|--------|-------------|-------|
| Security | `users`, `roles`, `modules`, `roles_users`, `roles_modules` | RBAC junction tables |
| Catalog | `products`, `variants`, `categories`, `brands`, `images` | Products have variants |
| Inventory | `warehouses`, `stocks`, `movements` | Stock per variant per warehouse |
| Customers | `customers`, `customer_addresses` | Similar to users, with addresses |
| Orders | `orders`, `order_items`, `order_status_histories` | Status history tracking |
| Locations | `ubigeos` | Reference data, 1833 districts |

### Future Modules (Guidelines)

**RMA/Returns:** Link to `orders`, `order_items`. Status history pattern.

**Purchases:** Mirror of orders for supplier purchases. Link to `warehouses` for receiving.

**Logistics:** Shipment tracking. Link to `orders`, `warehouses`.

**Invoices:** Link to `orders`. Store PDF URL or generated data.

**Settings:** Key-value table or typed settings table. System configuration.

---

## 10. Anti-Patterns (AVOID)

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Using `SERIAL` | Deprecated | Use `GENERATED ALWAYS AS IDENTITY` |
| `float`/`double` for money | Precision loss | Use `NUMERIC(12,2)` |
| `timestamp` without timezone | Timezone ambiguity | Use `timestamptz` |
| Modifying V__ migrations | Checksum mismatch | Create new V__ migration |
| Storing formatted phone | Data inconsistency | Store plain 9 digits |
| Over-normalizing for MVP | Unnecessary complexity | Keep it simple |
| No indexes on FKs | Slow JOINs | Always index FK columns |

---

## 11. Migration Checklist

Before creating a new migration:

- [ ] Table names are plural, snake_case
- [ ] All FKs have corresponding indexes
- [ ] Audit columns included (is_active, created_at, updated_at)
- [ ] Money uses NUMERIC(12,2)
- [ ] Timestamps use timestamptz
- [ ] CHECK constraints for enums (prefer over ENUM TYPE)
- [ ] Unique constraints where needed
- [ ] ON DELETE behavior explicitly defined
- [ ] File follows Flyway naming: `V{N}__description.sql`
- [ ] `pegasus_v2_db.sql` updated to reflect changes

---

## 12. Team Workflow: Single Migration Owner

**RULE: Only one person (project lead) creates migration files. Team members propose changes via PR comments/descriptions with SQL suggestions.**

**Why:**
- Zero conflicts (V3, V4, V5 always in order)
- Single source of truth for schema
- Schema integrity protected by review
- Clear audit trail

**Workflow:**
1. Dev proposes: "Add variants table" (PR description or comment with SQL)
2. Project lead: Reviews, creates `V{N}__add_variants_table.sql`
3. Project lead: Merges to main
4. Team: Pulls and runs migrations

**Migration File Template:**
ALWAYS start with this comment on line 1:
```sql
-- Only the project lead should create migrations. Team members: propose changes in PR descriptions with SQL suggestions.

-- Migration description
-- Created: [date/reason]
```

**Example:**
```sql
-- Only the project lead should create migrations. Team members: propose changes in PR descriptions with SQL suggestions.

CREATE TABLE public.variants (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    ...
);
```

---

## 13. Quick Reference

**Common Column Patterns:**
```sql
-- Standard ID
id bigint NOT NULL GENERATED ALWAYS AS IDENTITY

-- Audit columns
is_active boolean NOT NULL DEFAULT true
created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP

-- Money
price numeric(12,2) NOT NULL
total numeric(12,2) NOT NULL

-- Ubigeo reference
ubigeo_id varchar(6) NOT NULL REFERENCES ubigeos(id)

-- Status with enum
status order_status_enum NOT NULL DEFAULT 'PENDING'

-- JSONB with index
specs jsonb NOT NULL DEFAULT '{}'
-- + CREATE INDEX idx_table_specs ON table USING gin(specs);
```
