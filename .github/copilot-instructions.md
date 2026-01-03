## 🦄 Project Context: Pegasus E-commerce (MVP)

**Description:**
Pegasus is a monolithic e-commerce backend built with Spring Boot and PostgreSQL, designed for an academic MVP. The system serves two distinct user types: **Backoffice Staff** (Admins/Workers) and **Storefront Customers**.

### 1. Architectural Style: Package-by-Feature
**Strict Rule:** Do not organize code by layers (e.g., do not create `com.pegasus.controllers`). Organize by **Feature Modules**.
- **Root:** `com.pegasus.ecommerce`
- **Feature Modules:** Located in `/features`. Each folder (e.g., `/features/catalog`, `/features/order`) must contain its own `controller`, `service`, `repository`, `entity`, and `dto` sub-packages.
- **Shared:** Common utilities and cross-cutting concerns (like `locations/Ubigeo`) go in `/shared`.

### 2. Security & Authentication Strategy
**Dual-Authentication Model:**
- We do **NOT** mix Admins and Customers in a single table.
- **Backoffice Users:** Entity `User` in `features/user`. Managed by `UserAuthService`.
- **Storefront Customers:** Entity `Customer` in `features/crm`. Managed by `CustomerAuthService`.
- **Orchestration:** The `security/auth` package acts as the traffic controller. It receives login requests and delegates to the correct service.
- **JWT:** Centralized in `security/jwt/JwtUtils`. It signs tokens with a custom claim `userType` ("ADMIN" or "CUSTOMER") to identify the token owner in subsequent requests.

### 3. Database & JPA Conventions (PostgreSQL)
- **Language:** All tables and columns must be named in **snake_case** in **English**.
- **IDs:** Use `BIGINT GENERATED ALWAYS AS IDENTITY`.
- **Money:** Always use `NUMERIC(12, 2)` (mapped to `BigDecimal` in Java). Never use `Float` or `Double`.
- **JSONB:** Heavily used for snapshots and flexible data.
  - `orders.shipping_address` (Snapshot of the address at purchase time).
  - `products.specs` and `variants.attributes`.
  - Mapped to `Map<String, Object>` or `JsonNode` in Java.
- **Locations (Ubigeo):** Use the `shared/locations` module. It maps to a **single flat table** `ubigeos` (id, department, province, district), NOT three separate tables.
- **Logic:** No database triggers/functions for business logic. All calculations (totals, tax) happen in the Java `Service` layer.

### 4. Coding Standards
- **DTOs:** Never expose Entities in Controllers. Use Records (Java 17+) or Classes for DTOs (Request/Response).
- **Services:** Business logic lives here. Controllers should be thin.
- **Repositories:** Use `JpaRepository`.
- **Exceptions:** Throw custom exceptions from `exception/` package; do not return generic `ResponseEntity` errors manually.

### 5. Tone & Output Format
- **Professional & Technical:** Maintain a strict, professional tone.
- **No Emojis:** Do NOT use emojis in any part of the response, comments, or commit messages. The output must be clean text and code only.
- **Concise:** Avoid conversational filler. Go straight to the solution.