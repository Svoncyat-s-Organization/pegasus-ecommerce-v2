---
applyTo: "pegasus-backend/**/*.java, pegasus-backend/pom.xml, pegasus-backend/src/main/resources/**/*"
---

# Backend Context: Spring Boot 4.x

## CRITICAL RULES (Read First)

**Peru Validations:** See `copilot-instructions.md` for DNI/CE/Phone/Currency/Ubigeo/Timezone rules.

**Jakarta EE:** Use `jakarta.*` imports (NOT `javax.*`)

**Environment Variables (MANDATORY):**
- `.env` file at `pegasus-backend/.env` root
- `spring-boot-dotenv` v5.1.0 loads automatically on startup
- NO manual sourcing, NO wrapper scripts needed
- Required vars: DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD, JWT_SECRET, JWT_EXPIRATION_MS, SERVER_PORT
- NEVER commit .env, use .env.example for team

**Quality:** Code MUST compile (`./mvnw clean compile`) before submission.

---

## 1. Tech Stack

```json
{
  "framework": "Spring Boot 4.0.1 (Jakarta EE)",
  "java": "17",
  "security": "Spring Security + JJWT 0.13.0",
  "database": "PostgreSQL + Flyway",
  "mapping": "MapStruct 1.6.3",
  "boilerplate": "Lombok",
  "docs": "SpringDoc OpenAPI (Swagger)"
}
```

**Flyway:**
- Auto-runs on startup (`spring.flyway.enabled=true`)
- Naming: `V{version}__{description}.sql` (versioned), `R__{description}.sql` (repeatable)
- Repeatable MUST be idempotent: `DELETE FROM ... WHERE ...` before `INSERT`
- NEVER modify executed migrations (creates checksum mismatch)

**MapStruct:**
```java
@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User entity);
    User toEntity(CreateUserRequest request);
}
```

---

## 2. Architecture: Package-by-Feature

**Structure:** `com.pegasus.backend/features/{module}/`

```
backend/
├── features/
│   ├── catalog/       # controller, service, repository, entity, dto, mapper
│   ├── customer/      # Storefront customers
│   ├── user/          # Backoffice staff identities
│   ├── rbac/          # Roles, permissions, assignments
│   ├── order/
│   ├── inventory/
│   ├── dashboard/     # NO entity/repository (reads from other modules)
│   └── report/        # NO entity/repository (aggregates data)
├── shared/
│   ├── entity/        # BaseEntity.java (isActive, createdAt, updatedAt)
│   ├── locations/     # Ubigeo (controller, dto, entity, repository, service)
│   ├── enums/         # DocumentType, OrderStatus, PaymentMethod
│   ├── utils/         # DateUtils, PasswordUtils (NO business logic)
│   └── dto/           # PageResponse<T>, ErrorResponse
├── security/
│   ├── jwt/           # JwtUtils (generate/validate tokens)
│   └── auth/          # AuthController (routes to UserAuthService/CustomerAuthService)
├── config/            # SecurityConfig, CorsConfig, OpenApiConfig
└── exception/         # GlobalExceptionHandler, custom exceptions
```

**Module Anatomy:** `features/catalog/`
```
catalog/
├── controller/   # REST endpoints (@RestController)
├── service/      # Business logic (@Service)
├── repository/   # JpaRepository
├── entity/       # Product.java (extends BaseEntity)
├── dto/          # ProductResponse, CreateProductRequest
└── mapper/       # ProductMapper (MapStruct interface)
```

**User vs RBAC Separation:**
- `/features/user`: Manages identities (CRUD staff, credentials, personal data) → Table: `users`
- `/features/rbac`: Manages access control (roles, permissions, user-role assignments) → Tables: `roles`, `modules`, `roles_users`, `roles_modules`

**Dashboard/Report:** NO entities/repositories, read from other modules

---

## 3. Database & JPA

**Conventions:**
- Tables/columns: `snake_case` (English)
- IDs: `BIGINT GENERATED ALWAYS AS IDENTITY`
- Money: `NUMERIC(12, 2)` → `BigDecimal` (NEVER Float/Double)
- JSONB: Map to `Map<String, Object>` using `@JdbcTypeCode(SqlTypes.JSON)`

**BaseEntity Pattern (MANDATORY):**
```java
@MappedSuperclass
@Data
public abstract class BaseEntity {
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}

// All entities MUST extend BaseEntity
@Entity
@Table(name = "products")
@Data
@EqualsAndHashCode(callSuper = true)
public class Product extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // ...
}
```

---

## 4. Security: Dual-Model (Admin vs Customer)

**Separation:**
1. **Backoffice:** `User` entity (features/user), managed by `UserAuthService`
2. **Storefront:** `Customer` entity (features/customer), managed by `CustomerAuthService`
3. **Orchestration:** `security/auth/AuthController` routes login requests
4. **JWT:** `security/jwt/JwtUtils` signs tokens with claim `userType` ("ADMIN" or "CUSTOMER")

**Endpoint Patterns:**
- Public: `/api/auth/**` (login, register)
- Backoffice: `/api/admin/**` (requires ADMIN role)
- Storefront: `/api/customer/**` (requires CUSTOMER role)

**Flow:**
1. Client → `/api/auth/{admin|customer}/login`
2. Backend validates → generates JWT with `userType`
3. Client stores token → includes in `Authorization: Bearer <token>`
4. `JwtAuthenticationFilter` validates → sets `SecurityContext`

---

## 5. Naming Conventions

**Packages:** lowercase, no underscores (`customer`, `productcatalog`)  
**Classes:**
- Entities: Singular (`User`, `Product`)
- DTOs: `{Entity}{Purpose}` (`UserResponse`, `CreateProductRequest`)
- Services: `{Entity}Service` (`UserService`)
- Repositories: `{Entity}Repository` (`UserRepository`)
- Controllers: `{Entity}Controller` (`UserController`)
- Mappers: `{Entity}Mapper` (`UserMapper`)

**Methods:**
- Services: Business verbs (`createUser`, `findById`, `updateOrder`)
- Repositories: JPA conventions (`findByEmail`, `existsByUsername`)

**Variables:** camelCase (`userId`, `productName`)  
**Constants:** UPPER_SNAKE_CASE (`MAX_RETRIES`)

---

## 6. Coding Standards

### A. SOLID Principles

**SRP:** Controllers = routing ONLY, Services = business logic, Entities = DB state  
**DIP:** Constructor injection (`@RequiredArgsConstructor`), NO `@Autowired` on fields  
**OCP:** Strategy Pattern for complex conditionals (e.g., payment methods)

### B. DRY

- Common logic → `shared/utils`
- All entities extend `BaseEntity`
- Extract repeated queries to repository methods

### C. DTOs (MANDATORY)

```java
// Use records for simple DTOs
public record UserResponse(Long id, String username, String email) {}

// Use classes with Lombok for builders
@Data
@Builder
public class CreateUserRequest {
    private String username;
    private String email;
    private String password;
}
```

### D. Validation

```java
@NotNull(message = "El nombre es requerido")
@Email(message = "Formato de correo inválido")
private String email;
```

### E. Repository Search (MANDATORY)

```java
@Query("SELECT u FROM User u WHERE " +
       "LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
       "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
       "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%'))")
Page<User> searchUsers(@Param("search") String search, Pageable pageable);
```

### F. Service Layer

```java
public PageResponse<UserResponse> getAllUsers(String search, Pageable pageable) {
    Page<User> page = (search != null && !search.isBlank())
        ? userRepository.searchUsers(search.trim(), pageable)
        : userRepository.findAll(pageable);
    
    return new PageResponse<>(...);
}
```

### G. Controller Layer

```java
@GetMapping
public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
        @RequestParam(required = false) String search,
        @PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(userService.getAllUsers(search, pageable));
}
```

### H. Transactions

```java
@Transactional  // ONLY on methods that modify data
public UserResponse createUser(CreateUserRequest request) {
    // ...
}
```

---

## 7. Testing (Write ONLY when requested)

**Location:** `src/test/java/com/pegasus/backend/` (mirrors main structure)

**Unit Tests:**
```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock private UserRepository userRepository;
    @InjectMocks private UserService userService;
    
    @Test
    void createUser_ShouldReturnUserResponse() {
        when(userRepository.save(any())).thenReturn(new User());
        UserResponse response = userService.createUser(request);
        assertNotNull(response);
        verify(userRepository).save(any());
    }
}
```

**Integration Tests:**
```java
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerIntegrationTest {
    @Autowired private MockMvc mockMvc;
    
    @Test
    void getAllUsers_ShouldReturnPagedResponse() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray());
    }
}
```

**Coverage:** 70% for critical paths (auth, payments, inventory)

---

## 8. Error Handling

**Strategy:**
- **Controller:** Catch NOTHING
- **Service:** Throw business exceptions (`ResourceNotFoundException`)
- **Repository:** Let JPA exceptions bubble up
- **GlobalExceptionHandler:** Convert to `ErrorResponse`

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "Not Found",
            ex.getMessage(),
            extractPath(request),
            OffsetDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    private String extractPath(WebRequest request) {
        return request.getDescription(false).replace("uri=", "");
    }
}

public record ErrorResponse(
    int status,
    String error,
    String message,
    String path,
    OffsetDateTime timestamp
) {}
```

---

## 9. Logging

**Use:** SLF4J + Logback with `@Slf4j` Lombok annotation

```java
@Slf4j
@Service
public class UserService {
    public UserResponse createUser(CreateUserRequest request) {
        log.info("Creating user: {}", request.getUsername());
        try {
            // ...
        } catch (Exception e) {
            log.error("Failed to create user: {}", request.getUsername(), e);
            throw e;
        }
    }
}
```

**Levels:**
- **ERROR:** Exceptions, data loss (`log.error("Failed to create user: {}", username, exception)`)
- **WARN:** Degraded functionality (`log.warn("User attempted login with invalid credentials: {}", username)`)
- **INFO:** Business events (`log.info("User created successfully: {}", user.getUsername())`)
- **DEBUG:** Detailed flow (`log.debug("Processing order with {} items", orderItems.size())`)

**Best Practices:**
- Parameterized logging: `log.info("User: {}", username)` NOT `"User: " + username`
- Log exceptions with context: `log.error("Error processing order: {}", orderId, exception)`
- NO sensitive data (passwords, tokens, credit cards)

**Config (application.properties):**
```properties
logging.level.root=INFO
logging.level.com.pegasus.backend=DEBUG
logging.level.org.hibernate.SQL=DEBUG
```

---

## 10. Quality Verification

**Before submitting:**

```bash
# 1. Compile
./mvnw clean compile  # MUST show BUILD SUCCESS

# 2. Run
./mvnw spring-boot:run  # MUST start without red errors

# 3. Database (if needed)
source .env && PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USERNAME -d $DB_NAME -c "SELECT 1;"
```

**Alternative Approach, Development Workflow (ONLY IN WSL2 OR LINUX):**
During development, when testing migrations, use this workflow:
```bash
# Drop the entire database
sudo -u postgres dropdb pegasus_v2_db

# Recreate from scratch
sudo -u postgres createdb pegasus_v2_db

# Run backend (Flyway will apply all migrations)
./mvnw spring-boot:run
```

**Checklist:**
- [ ] Code compiles
- [ ] No unused imports
- [ ] Proper annotations (@Service, @Repository, @RestController)
- [ ] All entities extend BaseEntity
- [ ] DTOs used (NO exposed entities)
- [ ] Constructor injection (@RequiredArgsConstructor)
- [ ] Search queries with JPQL multi-field LIKE
- [ ] Transactions on write methods
- [ ] BCrypt for passwords
- [ ] Application starts without errors

---

## 11. Troubleshooting (Quick Reference)

| Error | Cause | Solution |
|-------|-------|----------|
| Bean not found | Missing @Service/@Repository | Add annotation |
| Circular dependency | Two services depend on each other | Refactor or use @Lazy (not recommended) |
| Failed to configure DataSource | Missing .env | Verify .env exists with DB credentials |
| Flyway checksum mismatch | Modified executed migration | NEVER modify V__ files, create new migration |
| Table already exists | Migrations on existing DB | Use Flyway repair or drop/recreate DB |
| 401 Unauthorized | Missing/invalid JWT | Verify Authorization: Bearer <token> header |
| JWT signature mismatch | JWT_SECRET changed | Login again with correct secret |
| Connection refused 5432 | PostgreSQL not running | Start PostgreSQL, verify port in .env |
| Password authentication failed | Wrong DB credentials | Verify DB_USERNAME/DB_PASSWORD in .env |

---

## Appendix: Common Patterns

### BaseEntity (Mandatory)
```java
@MappedSuperclass
@Data
public abstract class BaseEntity {
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
```

**Note:** Use `OffsetDateTime` (not `LocalDateTime`) for proper timezone handling with PostgreSQL `timestamptz`. Hibernate's `@CreationTimestamp` and `@UpdateTimestamp` handle automatic population.

### Typical Controller
```java
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management")
public class UserController {
    
    private final UserService userService;
    
    @GetMapping
    @Operation(summary = "Get all users")
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(search, pageable));
    }
    
    @PostMapping
    @Operation(summary = "Create user")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(userService.createUser(request));
    }
}
```

### Typical Service
```java
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    
    public PageResponse<UserResponse> getAllUsers(String search, Pageable pageable) {
        Page<User> page = (search != null && !search.isBlank())
            ? userRepository.searchUsers(search.trim(), pageable)
            : userRepository.findAll(pageable);
        
        List<UserResponse> content = page.getContent().stream()
            .map(userMapper::toResponse)
            .toList();
        
        return new PageResponse<>(
            content,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages()
        );
    }
    
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        log.info("Creating user: {}", request.getUsername());
        
        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        User saved = userRepository.save(user);
        log.info("User created successfully: {}", saved.getUsername());
        
        return userMapper.toResponse(saved);
    }
}
```
