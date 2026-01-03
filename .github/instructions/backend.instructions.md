---
applyTo: "**/*.java, pom.xml, src/main/resources/**/*"
---

# 🐎 Backend Context: Spring Boot 4.x

## 1. Tech Stack (from pom.xml)
* **Framework:** Spring Boot 4.0.1 (Jakarta EE environment).
    * Use `jakarta.*` imports (e.g., `jakarta.persistence.*`, `jakarta.validation.*`), NOT `javax.*`.
* **Java:** Version 17.
* **Security:** Spring Security + **JJWT (0.13.0)**. (Dual Auth: User vs Customer).
* **Database:** PostgreSQL + Flyway (Migrations in `src/main/resources/db/migration`).
* **Mapping:** **MapStruct 1.6.3**.
    * Always use MapStruct interfaces for DTO-Entity conversion.
    * Use `@Mapper(componentModel = "spring")`.
* **Boilerplate:** **Lombok**.
    * Use `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`.
    * Use `@RequiredArgsConstructor` for Constructor Injection.
* **Documentation:** **SpringDoc OpenAPI (Swagger)**.
    * Document Controllers with `@Operation`, `@ApiResponse`, and `@Tag`.

## 2. Architectural Style & Directory Structure
**STRICT RULE:** Do NOT organize code by technical layers. Organize by **Feature Modules**.

**Directory Structure:**
* **Root:** `com.pegasus.backend` (ArtifactId: backend)

* **`/features`**: Core business modules (Domain Driven).
    * Each folder (e.g., `/features/catalog`, `/features/order`, `/features/customer`, `/features/user`) MUST contain its own technical sub-packages: `controller`, `service`, `repository`, `entity`, `dto`, `mapper`.
    * **Note:** Entities `User` (Staff) live in `features/user`, and `Customer` (Storefront) live in `features/customer`.
    * **`/features/user` vs `/features/rbac`**: Separation of concerns for backoffice staff management:
        * **`/features/user`**: Manages user **identities** (CRUD of staff members, credentials, personal data). Contains `User` entity and `UserAuthService`.
        * **`/features/rbac`**: Manages **what each role can do** (roles, permissions, assignments). Contains `Role`, `Permission`, `UserRole` entities. Separated to avoid bloating `/features/user` with authorization logic.
    * **`/features/customer`**: Manages storefront customers. Contains `Customer` entity and all customer-related logic (addresses, contact info, segmentation). Do NOT mix with `/features/user`.

* **`/shared`**: Cross-cutting concerns and shared resources.
    * **`/shared/locations`**: Handles the **Ubigeo** logic based on the single `ubigeos` table.
        * It acts like a "Read-Only Feature" (Service/Repository/Entity) used by `customer` (addresses) and `inventory` (warehouses) to validate location IDs.
    * **`/shared/enums`**: The **ONLY** place for global enums (e.g., `DocumentType`, `OrderStatus`, `PaymentMethod`). This prevents circular dependencies between features.
    * **`/shared/utils`**: Stateless helper classes (e.g., `DateUtils`, `PasswordUtils`, `StringHelper`). No business logic here.
    * **`/shared/dto`**: Global DTOs (e.g., `PageResponse<T>`, `ErrorResponse`).

* **`/security`**: Centralized Authentication Infrastructure.
    * **`/security/jwt`**: The "Key Maker". Contains `JwtUtils` to generate/validate tokens. Agnostic of user type.
    * **`/security/auth`**: The "Orchestrator". Contains `AuthController`. It receives login requests and routes them to the correct feature service (`UserAuthService` or `CustomerAuthService`).

* **`/config`**: Global configurations (Security, Cors, OpenAPI/Swagger, Jackson).
* **`/exception`**: Global exception handling (`GlobalExceptionHandler`).

* **JSONB:** Use heavily for snapshots (Address, Product Specs). Map to `Map<String, Object>`.

## 3. Database & JPA Conventions
* **Naming:** Tables and columns in **snake_case** (English).
* **IDs:** `BIGINT GENERATED ALWAYS AS IDENTITY`.
* **Money:** `NUMERIC(12, 2)` mapped to `BigDecimal`. **NEVER** use Float/Double.
* **JSONB:** Heavily used (e.g., `shipping_address`, `specs`). Map to `Map<String, Object>` or `JsonNode` using Hibernate 6+ types (`@JdbcTypeCode(SqlTypes.JSON)`).
* **Logic:** Business logic stays in Java Services, not DB triggers.

## 4. Security Strategy (Dual-Model)
**We separate Admins and Customers:**
1.  **Backoffice:** Entity `User` (in `features/user`). Managed by `UserAuthService`.
2.  **Storefront:** Entity `Customer` (in `features/customer`). Managed by `CustomerAuthService`.
3.  **Orchestration:** `security/auth` handles login requests and delegates to the correct service.
4.  **JWT:** `security/jwt/JwtUtils` signs tokens with a custom claim `userType` ("ADMIN" or "CUSTOMER").

## 5. Coding Standards & Principles
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

## 5. Quality Assurance
* Ensure all code provided compiles correctly.
* If acting as an Agent/CLI: Run `./mvnw clean compile` to verify before submitting changes.
* Do not leave unused imports or broken references.