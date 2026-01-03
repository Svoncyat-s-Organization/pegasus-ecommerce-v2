# Project Context: Pegasus E-commerce (Backend)

**Description:**
Pegasus is a monolithic e-commerce backend built with **Spring Boot 4.0.1** and **PostgreSQL**, designed for an academic MVP. The system serves two distinct user types: **Backoffice Staff** (Admins/Workers) and **Storefront Customers**.

---

## 1. Database & Migrations (CRITICAL)
* **Schema Reference:** The full database design script is located at: `src/main/resources/db/pegasus_v2_db.sql`. Use this file to understand the table relationships, constraints, and data types.
* **Migrations:** We use **Flyway** for database version control.
    * All migration scripts must be placed in: `src/main/resources/db/migration/`.
    * Naming convention: `V1__init_schema.sql`, `V2__add_users.sql`, etc. Repeatable migrations are used for seed: `R__01_seed_users`, `R__02_seed_customers`, etc.
    * Do NOT modify the database schema through JPA/Hibernate (`ddl-auto` is disabled). Always create a Flyway migration script.

---

## 2. Tech Stack & Dependencies
* **Framework:** Spring Boot 4.0.1 (Jakarta EE environment).
    * Use `jakarta.*` imports (e.g., `jakarta.persistence.*`, `jakarta.validation.*`), NOT `javax.*`.
* **Language:** Java 17.
* **Mapping:** **MapStruct 1.6.3**.
    * Always use MapStruct interfaces for DTO-Entity conversion.
    * Use `@Mapper(componentModel = "spring")`.
* **Boilerplate:** **Lombok**.
    * Use `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`.
    * Use `@RequiredArgsConstructor` for Constructor Injection.
* **Documentation:** **SpringDoc OpenAPI (Swagger)**.
    * Document Controllers with `@Operation`, `@ApiResponse`, and `@Tag`.
* **Security:** Spring Security + **JJWT (0.13.0)**.
* **Database:** PostgreSQL.

---

## 3. Architectural Style: Package-by-Feature
**STRICT RULE:** Do NOT organize code by technical layers. Organize by **Feature Modules**.

**Directory Structure:**
* **Root:** `com.pegasus.backend` (ArtifactId: backend)
* **`/features`**: Business modules. Each folder (e.g., `/features/catalog`, `/features/order`) MUST contain:
    * `controller/`
    * `service/`
    * `repository/`
    * `entity/`
    * `dto/`
    * `mapper/` (For MapStruct interfaces)
* **`/shared`**: Common utilities (e.g., `locations/`, `utils/`, `enums/`). This is the only place for enums like `DocumentType`, `OperationType`, `OrderStatus`, etc.
* **`/security`**: Authentication infrastructure (`auth/`, `jwt/`).
* **`/config`**: Global configurations.
* **`/exception`**: Global exception handling.

---

## 4. Database & JPA Conventions
* **Naming:** Tables and columns in **snake_case** (English).
* **IDs:** `BIGINT GENERATED ALWAYS AS IDENTITY`.
* **Money:** `NUMERIC(12, 2)` mapped to `BigDecimal`. **NEVER** use Float/Double.
* **JSONB:** Heavily used (e.g., `shipping_address`, `specs`). Map to `Map<String, Object>` or `JsonNode` using Hibernate 6+ types (`@JdbcTypeCode(SqlTypes.JSON)`).
* **Logic:** Business logic stays in Java Services, not DB triggers.

---

## 5. Security Strategy (Dual-Model)
**We separate Admins and Customers:**
1.  **Backoffice:** Entity `User` (in `features/user`). Managed by `UserAuthService`.
2.  **Storefront:** Entity `Customer` (in `features/crm`). Managed by `CustomerAuthService`.
3.  **Orchestration:** `security/auth` handles login requests and delegates to the correct service.
4.  **JWT:** `security/jwt/JwtUtils` signs tokens with a custom claim `userType` ("ADMIN" or "CUSTOMER").

---

## 6. Coding Standards & Principles
* **SOLID Principles (Applied):**
    * **SRP (Single Responsibility):** Controllers MUST be thin (routing only). All business logic MUST live in Services. Entities MUST only represent DB state.
    * **DIP (Dependency Inversion):** Always use Constructor Injection (`@RequiredArgsConstructor`). Do not use `@Autowired` on fields.
    * **OCP (Open/Closed):** Use Strategy Pattern or Polymorphism for complex conditional logic (e.g., Payment Methods), instead of massive `if/else` blocks.
* **DRY (Don't Repeat Yourself):**
    * Extract common logic (e.g., date formatting, price calculation) to `shared/utils`.
    * Use `@MappedSuperclass` for common entity fields like `created_at`, `updated_at`, `is_active` (e.g., create a `BaseEntity`).
* **DTOs:** Mandatory. Never expose Entities in Controllers. Use Java `record` for DTOs if possible.
* **Validation:** Use `jakarta.validation` (`@NotNull`, `@Email`) in DTOs.
* **Repository:** Use `JpaRepository`.
* **MapStruct:** Use interfaces with `@Mapper(componentModel = "spring")`.

---

## 7. Tone & Output Format
* **Professional & Technical:** Maintain a strict, professional tone.
* **NO Emojis:** Do NOT use emojis. Output must be clean text and code only.
* **Concise:** Go straight to the solution.