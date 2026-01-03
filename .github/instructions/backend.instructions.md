---
applyTo: "pegasus-backend/**/*.java, pegasus-backend/pom.xml, pegasus-backend/src/main/resources/**/*"
---

# 🐎 Backend Context: Spring Boot 4.x

## 1. Tech Stack (from pom.xml)
* **Framework:** Spring Boot 4.0.1 (Jakarta EE environment).
    * Use `jakarta.*` imports (e.g., `jakarta.persistence.*`, `jakarta.validation.*`), NOT `javax.*`.
* **Java:** Version 17.
* **Security:** Spring Security + **JJWT (0.13.0)**. (Dual Auth: User vs Customer).
* **Database:** PostgreSQL + Flyway (Migrations in `src/main/resources/db/migration`).
    * **Flyway Naming:** `V{version}__{description}.sql` (versioned), `R__{description}.sql` (repeatable seeds).
    * **Example:** `V1__init_schema.sql`, `R__01_seed_ubigeo.sql`.
* **Environment Variables (required):**
    * `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` (Database connection).
    * `JWT_SECRET`, `JWT_EXPIRATION_MS` (Authentication).
    * `SERVER_PORT` (Application port).
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
    * **`mapper/` Subpackage:** Contains MapStruct interfaces for DTO-Entity conversion.
        * **Naming:** `{Entity}Mapper.java` (e.g., `UserMapper.java`, `ProductMapper.java`).
        * **Example:**
        ```java
        @Mapper(componentModel = "spring")
        public interface UserMapper {
            UserResponse toResponse(User entity);
            User toEntity(CreateUserRequest request);
        }
        ```
    * **Note:** Entities `User` (Staff) live in `features/user`, and `Customer` (Storefront) live in `features/customer`.
    * **`/features/user` vs `/features/rbac`**: Separation of concerns for backoffice staff management:
        * **`/features/user`**: Manages user **identities** (CRUD of staff members, credentials, personal data). Contains `User` entity and `UserAuthService`.
            * **Tables:** `users`
            * **Responsibilities:** Create/Update/Delete users, manage credentials, personal info.
            * **Does NOT handle:** Roles, permissions, or access control logic.
        * **`/features/rbac`**: Manages **access control** (what each role can do, which modules users can access).
            * **Tables:** `roles`, `modules`, `roles_users` (user-role assignments), `roles_modules` (role-module permissions).
            * **Entities:** `Role`, `Module`, `RoleUser`, `RoleModule`.
            * **Responsibilities:** Assign roles to users, define module permissions per role, manage access control.
            * **Related to User:** RBAC reads from `User` table via foreign keys, but does NOT manage user identity.
    * **`/features/customer`**: Manages storefront customers. Contains `Customer` entity and all customer-related logic (addresses, contact info, segmentation). Do NOT mix with `/features/user`.
    * **`/features/dashboard`**: Analytics dashboard module.
        * **Structure:** `controller/`, `dto/`, `service/`. NO `entity/`, NO `repository/`.
        * **NO database tables:** Reads data from other modules (catalog, orders, inventory) to generate metrics.
        * **Purpose:** Aggregate and present business KPIs (sales, inventory levels, top products, etc.).
    * **`/features/report`**: Report generation module.
        * **Structure:** `controller/`, `dto/`, `service/`. NO `entity/`, NO `repository/`.
        * **NO database tables:** Queries data from other modules to generate reports (PDF, Excel, CSV).
        * **Purpose:** Generate downloadable reports (sales reports, inventory reports, customer reports).

* **`/shared`**: Cross-cutting concerns and shared resources.
    * **`/shared/entity`**: Base classes for entities.
        * **`BaseEntity.java`**: Abstract `@MappedSuperclass` with common fields (`isActive`, `createdAt`, `updatedAt`).
        * All feature entities MUST extend `BaseEntity` to apply DRY principle.
    * **`/shared/locations`**: Handles the **Ubigeo** logic based on the single `ubigeos` table.
        * Structure: `controller/`, `dto/`, `entity/`, `repository/`, `service/`.
        * It acts like a "Read-Only Feature" used by `customer` (addresses) and `inventory` (warehouses) to validate location IDs (department, province, district).
        * **Entity:** `Ubigeo` (table: `ubigeos`, fields: `id`, `department`, `province`, `district`).
    * **`/shared/enums`**: The **ONLY** place for global enums (e.g., `DocumentType`, `OrderStatus`, `PaymentMethod`). This prevents circular dependencies between features.
    * **`/shared/utils`**: Stateless helper classes (e.g., `DateUtils`, `PasswordUtils`, `StringHelper`). No business logic here.
    * **`/shared/dto`**: Global DTOs (e.g., `PageResponse<T>`, `ErrorResponse`).

* **`/security`**: Centralized Authentication Infrastructure.
    * **`/security/jwt`**: The "Key Maker". Contains `JwtUtils` to generate/validate tokens. Agnostic of user type.
    * **`/security/auth`**: The "Orchestrator". Contains `AuthController`. It receives login requests and routes them to the correct feature service (`UserAuthService` or `CustomerAuthService`).

* **`/config`**: Global configurations.
    * **Files:** `SecurityConfig.java`, `CorsConfig.java`, `OpenApiConfig.java`, `JacksonConfig.java` (if needed).
    * Do NOT create feature-specific configs here. Keep them in their respective feature packages.
* **`/exception`**: Global exception handling.
    * **`GlobalExceptionHandler.java`**: `@RestControllerAdvice` class to handle all exceptions (`@ExceptionHandler`).
    * **Custom Exceptions:** Create custom exceptions here (e.g., `ResourceNotFoundException`, `InvalidCredentialsException`).
    * Return structured error responses using `ErrorResponse` DTO from `shared/dto`.

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

**API Endpoint Patterns:**
* **Public:** `/api/auth/**` (login, register).
* **Backoffice:** `/api/admin/**` (requires ADMIN role, e.g., `/api/admin/users`, `/api/admin/products`).
* **Storefront:** `/api/customer/**` (requires CUSTOMER role, e.g., `/api/customer/orders`, `/api/customer/profile`).
* **Authentication Flow:**
    1. Client sends credentials to `/api/auth/{admin|customer}/login`.
    2. Backend validates, generates JWT with `userType` claim.
    3. Client stores token (localStorage/sessionStorage).
    4. Client includes token in header: `Authorization: Bearer <token>`.
    5. `JwtAuthenticationFilter` validates token and sets `SecurityContext`.

## 5. Naming Conventions
* **Packages:** lowercase, no underscores (e.g., `customer`, `productcatalog`).
* **Classes:**
    * Entities: Singular noun (e.g., `User`, `Product`).
    * DTOs: `{Entity}{Purpose}` (e.g., `UserResponse`, `CreateProductRequest`).
    * Services: `{Entity}Service` (e.g., `UserService`, `OrderService`).
    * Repositories: `{Entity}Repository` (e.g., `UserRepository`).
    * Controllers: `{Entity}Controller` (e.g., `UserController`).
    * Mappers: `{Entity}Mapper` (e.g., `UserMapper`).
* **Methods:**
    * Services: Business action verbs (e.g., `createUser`, `findById`, `updateOrder`, `deactivateProduct`).
    * Repositories: JPA naming conventions (e.g., `findByEmail`, `existsByUsername`).
    * Controllers: HTTP method mapping (e.g., `@GetMapping`, `@PostMapping`).
* **Variables:** camelCase (e.g., `userId`, `productName`).
* **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `DEFAULT_PAGE_SIZE`).

## 6. Coding Standards & Principles
* **Peru-Specific Business Rules:**
    * **DocumentType Enum:** Only `DNI` (8 digits) or `CE` (9-12 alphanumeric).
    * **Ubigeo:** Always validate location IDs against `ubigeos` table (department, province, district).
    * **Phone:** Peru mobile format (9 digits starting with 9).
    * **Currency:** Peruvian Sol (PEN). Use `BigDecimal` with `NUMERIC(12, 2)` for money.
    * **Timezone:** Peru uses UTC-5 (no DST). Store timestamps as `timestamptz` (UTC), convert to Peru time in frontend.
* **SOLID Principles (Applied):**
    * **SRP (Single Responsibility):** Controllers MUST be thin (routing only). All business logic MUST live in Services. Entities MUST only represent DB state.
    * **DIP (Dependency Inversion):** Always use Constructor Injection (`@RequiredArgsConstructor`). Do not use `@Autowired` on fields.
    * **OCP (Open/Closed):** Use Strategy Pattern or Polymorphism for complex conditional logic (e.g., Payment Methods), instead of massive `if/else` blocks.
* **DRY (Don't Repeat Yourself):**
    * Extract common logic (e.g., date formatting, price calculation) to `shared/utils`.
    * **BaseEntity Pattern (MANDATORY):** All entities MUST extend `BaseEntity` to inherit common fields (`isActive`, `createdAt`, `updatedAt`).
        * Example:
        ```java
        @Entity
        @Table(name = "products")
        @Data
        @EqualsAndHashCode(callSuper = true) // Important!
        public class Product extends BaseEntity {
            @Id
            @GeneratedValue(strategy = GenerationType.IDENTITY)
            private Long id;
            // ... other fields
        }
        ```
* **DTOs:** Mandatory. Never expose Entities in Controllers. Use Java `record` for DTOs when possible (simple data carriers). Use classes with Lombok when you need builders or mutable state.
* **Validation:** Use `jakarta.validation` (`@NotNull`, `@Email`) in DTOs.
* **Repository:** Use `JpaRepository`.
* **MapStruct:** Use interfaces with `@Mapper(componentModel = "spring")`.
* **Transactions:** Use `@Transactional` on Service methods that modify data (create, update, delete). Do NOT use on read-only methods.
* **Password Handling:** Always use `BCryptPasswordEncoder` (injected via Spring Security). Store only hashed passwords in `password_hash` column.

## 7. Quality Assurance & Verification
**CRITICAL:** After code changes, verify the backend works correctly.

**If acting as Agent/CLI, run in sequence:**
1. `./mvnw clean compile` → Must show `BUILD SUCCESS`, no errors.
2. `./mvnw spring-boot:run` → Must start with `Started PegasusEcommerceApplication in X seconds`. **NO red error text** in console (yellow warnings OK).

**Before submitting code:**
* Remove unused imports.
* Ensure proper Spring annotations (`@Service`, `@Repository`, `@RestController`).
* Fix compilation errors, circular dependencies, and missing beans.
* Code MUST compile and run without errors.