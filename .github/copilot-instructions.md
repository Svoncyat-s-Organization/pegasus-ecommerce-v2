# Project Context: Pegasus E-commerce (MVP)

**Description:**
Pegasus is a monolithic e-commerce backend (Spring Boot) and SPA frontend (React) built for an academic MVP.
**Architecture:** Package-by-Feature (Strict). Do not organize by layers. The system serves two distinct user types: **Backoffice Staff** (Admins/Workers) and **Storefront Customers**.

**Project Context:**
* **Market:** 100% Peruvian, 100% online e-commerce platform.
* **Stage:** MVP in early development phase.
* **Scope:** Work ONLY with existing modules. Do NOT create or assume modules that don't exist in the codebase.

**Workspace Structure:**
This is a monorepo with two main folders:
* **`/pegasus-backend`**: Spring Boot 4.x backend (Java 17)
* **`/pegasus-frontend`**: React 19 + Vite frontend (TypeScript)

Always identify the correct folder before creating or modifying files.

**Technology Versions:**
* Specific versions (Spring Boot 4.0.1, React 19, JJWT 0.13.0, MapStruct 1.6.3, etc.) are documented in `pom.xml` (backend) and `package.json` (frontend).
* Always refer to these files as the source of truth for dependency versions.
* Do NOT hardcode versions in code - reference the build files instead.

**Business Domain (E-commerce MVP):**
* **Catalog**: Product management (SKU, price, stock, categories, brands, specs, variants, images).
* **Customer**: Customer accounts, addresses (Peru ubigeo), contact info.
* **Order**: Order lifecycle (items, status history, subtotal, taxes, shipping, total).
* **Inventory**: Warehouse stock, movements (in/out/adjustment), stock levels.
* **User**: Backoffice staff identities (CRUD: username, email, password, personal data).
* **RBAC**: Role-Based Access Control (roles, modules, permissions per module, user-role assignments).
    * **Separation Logic:** `/features/user` = user identity CRUD. `/features/rbac` = roles/permissions/assignments logic.
* **Locations**: Peru Ubigeo system (department, province, district) for addresses and warehouses.
* **Dashboard**: Analytics dashboard (NO database tables, reads from other modules for metrics).
* **Report**: Report generation (NO database tables, aggregates data from other modules).

## Peru-Specific Validations (Applies to Both Backend & Frontend)
**CRITICAL: These validation rules must be consistently applied across the entire stack.**

* **Document Types:**
    * **DNI (Documento Nacional de Identidad):** Exactly 8 numeric digits. Format: `12345678` (no separators).
    * **CE (Carné de Extranjería):** 9-12 alphanumeric characters.
    * **Validation:** Use enum `DocumentType` with only `DNI` and `CE` values.
* **Phone Numbers:**
    * **Format:** Peru mobile numbers have 9 digits starting with 9.
    * **Display:** `+51 999 999 999` (with country code and spaces).
    * **Storage:** Backend stores plain 9 digits without country code or spaces.
    * **Input:** Use simple Input with `maxLength={9}` and pattern validation. NEVER use `getValueFromEvent` for auto-formatting as it causes input bugs (double prefixes, character replacement).
    * **Example:** Stored: `987654321` → Displayed: `+51 987 654 321`.
    * **Frontend Implementation:**
      ```tsx
      // ✅ CORRECT: Simple validation, no auto-formatting
      <Form.Item
        name="phone"
        rules={[{ pattern: /^9\d{8}$/, message: 'Debe ser 9 dígitos e iniciar con 9' }]}
      >
        <Input placeholder="987654321" addonBefore="+51" maxLength={9} />
      </Form.Item>
      
      // ❌ WRONG: getValueFromEvent causes bugs
      <Form.Item
        name="phone"
        getValueFromEvent={(e) => formatPhone(cleanPhone(e.target.value))} // NO
      >
        <Input />
      </Form.Item>
      ```
* **Currency:**
    * **Symbol:** Peruvian Sol (PEN) - `S/`.
    * **Format:** `S/ 1,234.56` (thousands separator: comma, decimal: period).
    * **Storage:** Backend uses `BigDecimal` with `NUMERIC(12, 2)`. Frontend uses `number` type.
    * **NEVER use:** `Float` or `Double` for monetary values.
* **Ubigeo (Location System):**
    * **Structure:** Three-level hierarchy: Department → Province → District.
    * **Storage:** Single table `ubigeos` with columns: `id`, `department`, `province`, `district`.
    * **Usage:** Always reference by `id` (foreign key) in addresses and warehouse locations.
    * **Validation:** IDs must exist in `ubigeos` table.
* **Timezone:**
    * **Peru Time:** UTC-5 (no Daylight Saving Time).
    * **Storage:** Backend stores timestamps in UTC (`timestamptz` in PostgreSQL).
    * **Display:** Frontend converts UTC to Peru time for user presentation.
* **Language:**
    * **Code:** All variables, functions, and comments in English.
    * **UI:** All user-facing text (labels, buttons, messages, validations) in Spanish.

## 1. Quality Assurance
* **STRICT RULE:** Code provided MUST be executable and error-free.
* **Executable Code:** All code provided must be compile-ready.
* **Backend (Java):**
    * Ensure all code provided compiles correctly.
    * If acting as an Agent/CLI: Run `./mvnw clean compile` to verify before submitting changes.
    * Do not leave unused imports or broken references.
* **Frontend (React/Vite):**
    * Ensure code passes linting rules.
    * If acting as an Agent/CLI: Run `pnpm run lint` or `pnpm run build` to verify logic.
* **Testing Strategy:**
    * **Backend:** Unit tests go in `src/test/java/com/pegasus/backend/` mirroring the main structure.
    * **Frontend:** Test files should be colocated (e.g., `ProductList.test.tsx` next to `ProductList.tsx`).
    * Write tests ONLY when explicitly requested or when modifying critical logic.
* **Self-Correction:** If a generated solution is complex, review it against the project's compilation capability before outputting.

## 2. Tone & Output Format
* **Professional & Technical:** Maintain a strict, technical tone.
* **NO Emojis:** Do NOT use emojis in responses, comments, or commit messages. Tabler Icons (`@tabler/icons-react`) in React code are allowed.
* **English:** All code, variables, and comments must be in English.
* **Concise:** Go straight to the solution.

## 3. Development Approach (CRITICAL)
**When developing features, follow this pragmatic approach:**

1. **Understand First:**
   - Read existing code to understand patterns
   - Verify what files exist vs what needs to be created
   - Do NOT assume - always verify

2. **Plan Before Code:**
   - Identify dependencies (what files need to exist first)
   - Create files in correct order (config → types → stores → features)
   - Follow the scaffolding structure strictly

3. **Incremental Development:**
   - Create ONE file at a time
   - Verify it works before moving to next file
   - Do NOT create 10 files and then debug

4. **Error Handling:**
   - If compilation fails, check file existence FIRST
   - Fix actual code errors BEFORE changing configuration
   - Do NOT enter troubleshooting loops (max 3 attempts, then stop and report)

5. **Communication:**
   - Explain what you're creating and why
   - If stuck, ask user for clarification
   - Do NOT silently try 10 different solutions