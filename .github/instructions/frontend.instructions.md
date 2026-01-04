---
applyTo: "pegasus-frontend/**/*.ts, pegasus-frontend/**/*.tsx, pegasus-frontend/**/*.css, pegasus-frontend/package.json, pegasus-frontend/index.html, pegasus-frontend/vite.config.ts"
---

# 🦅 Frontend Context: React 19 + Vite

## 0. Initial Setup Strategy (When Starting from Empty Project)
**If the project is empty or missing core configuration, follow this order:**

1. **First: Core Configuration** (BEFORE writing features)
   - Create `src/config/api.ts` (Axios instance)
   - Create `src/config/queryClient.ts` (React Query config)
   - Create `src/types/index.ts` (Global types)

2. **Second: Global Setup** (BEFORE feature code)
   - Wrap App with `QueryClientProvider` in `main.tsx`
   - Setup React Router in `App.tsx`

3. **Third: Feature Development**
   - Create stores if needed (Zustand)
   - Develop features following the structure

**CRITICAL RULES for Initial Setup:**
- DO NOT create feature code before config files exist
- DO NOT assume files exist - verify with file_search or read_file first
- If imports fail, check if the imported file was created in previous steps
- Use RELATIVE paths (../../) - NO path aliases (@/) are configured

## 1. Tech Stack (from package.json)
* **Package Manager:** pnpm (NOT npm or yarn).
* **Core:** React 19, TypeScript, Vite 7.
* **Router:** React Router DOM v7 (Use strict typed routes).
* **State Management:**
    * **Server State:** TanStack Query (React Query) v5. **MANDATORY for API calls.**
    * **Global Client State:** Zustand.
* **HTTP Client:** Axios (configured in `src/config/api.ts`).
    * **Base URL:** Use environment variable `VITE_API_BASE_URL`.
    * **Interceptors:** Request interceptor adds `Authorization: Bearer <token>` from Zustand auth store.
    * **Error Handling:** Response interceptor catches 401 (redirect to login) and 500 (show toast).
* **Environment Variables:**
    * `VITE_API_BASE_URL` (Backend API URL, e.g., `http://localhost:8080/api`). **REQUIRED.**
    * `VITE_ENV` (Environment: `development`, `staging`, `production`). Optional, for conditional logic.
    * `VITE_ENABLE_LOGS` (Enable debug logs: `true`/`false`). Optional, for development debugging.
    * Store in `.env.local` (development, not committed) or `.env.production` (production build).
    * **Important:** All Vite env vars MUST start with `VITE_` prefix to be exposed to client.
* **Forms:** React Hook Form + Zod (`@hookform/resolvers`).
* **UI Libraries (STRICT):**
    * `features/backoffice/**` -> **MUST** use **Ant Design** (`antd`). Ant Design is strictly for Backoffice Staff UIs.
    * `features/storefront/**` -> **MUST** use **Mantine** (`@mantine/core`). Mantine is strictly for Storefront Customer UIs.
    * **Icons:** **ONLY** use **Tabler Icons** (`@tabler/icons-react`) for ALL icons across the entire project.
    * **NEVER** use `@ant-design/icons` or any other icon library. Tabler Icons are the single source of truth for icons.
    * **Icon Usage Examples:**
      ```tsx
      import { IconUser, IconLock, IconDashboard } from '@tabler/icons-react';
      
      // In components
      <IconUser size={18} />
      <IconDashboard size={20} stroke={1.5} />
      ```
* **Design Philosophy:**
    * **Professional, Elegant, Minimalist:** NO flashy designs, NO bright gradients, NO excessive colors.
    * Use neutral color palettes: whites, grays, subtle blues.
    * Clean layouts with proper spacing and typography hierarchy.
    * Avoid animations unless necessary for UX feedback.
    * Focus on readability and usability over visual impact.
* **Dates:** Day.js.

## 1.1. Import Strategy & TypeScript Configuration (Path Aliases)
**CRITICAL: This project uses PATH ALIASES for cleaner imports.**

**Path Aliases Configuration:**
The project is configured with the following path aliases in `tsconfig.app.json` and `vite.config.ts`:

```typescript
@/*           → src/*
@config/*     → src/config/*
@types        → src/types/index.ts
@stores/*     → src/stores/*
@layouts/*    → src/layouts/*
@routes/*     → src/routes/*
@shared/*     → src/shared/*
@features/*   → src/features/*
@components/* → src/components/*
```

**Import Rules:**
- **ALWAYS use path aliases** for absolute imports (recommended)
- Use relative paths ONLY for files within the same directory or nearby
- Do NOT add `.ts` or `.tsx` extensions in imports (Vite handles this)

**Examples:**
```tsx
// CORRECT ✅ - Use aliases for cross-directory imports
import { api } from '@config/api';
import type { User, LoginRequest } from '@types';
import { useAuthStore } from '@stores/backoffice/authStore';
import { BackofficeLayout } from '@layouts/backoffice';
import { LoginPage } from '@features/backoffice/auth/pages/LoginPage';
import { formatCurrency } from '@shared/utils/formatters';

// ACCEPTABLE ✅ - Relative for same directory
import { useLogin } from '../hooks/useLogin';
import { authApi } from './authApi';

// WRONG ❌ - Deep relative paths
import { api } from '../../../../config/api';  // Use @config/api instead
import { User } from '../../types';  // Use @types instead

// WRONG ❌ - File extensions
import { api } from '@config/api.ts';  // NO extensions
```

**TypeScript Configuration (tsconfig.app.json):**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@config/*": ["src/config/*"],
      "@types": ["src/types/index.ts"],
      "@stores/*": ["src/stores/*"],
      "@layouts/*": ["src/layouts/*"],
      "@routes/*": ["src/routes/*"],
      "@shared/*": ["src/shared/*"],
      "@features/*": ["src/features/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

**Vite Configuration (vite.config.ts):**
```typescript
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@config': path.resolve(__dirname, './src/config'),
      '@types': path.resolve(__dirname, './src/types/index.ts'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@features': path.resolve(__dirname, './src/features'),
      '@components': path.resolve(__dirname, './src/components'),
    },
  },
});
```

**Benefits:**
- ✅ Cleaner, more readable imports
- ✅ Easier refactoring (no path recalculation when moving files)
- ✅ Consistent import style across the codebase
- ✅ Better IDE autocomplete and navigation

## 2. Architectural Style: Package-by-Feature
**STRICT RULE:** Organize code by **Domain Feature**, split by User Scope.

**Directory Structure:**
`src/features/{scope}/{module}/`

* **Root Folders (Outside features):**
    * **`src/config/`**: Global configurations.
        * **`api.ts`**: Axios instance with interceptors, base URL, auth headers.
            * **Template:**
            ```typescript
            import axios from 'axios';
            
            export const api = axios.create({
              baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
              headers: { 'Content-Type': 'application/json' },
            });
            
            // Request interceptor: add auth token
            api.interceptors.request.use((config) => {
              const token = localStorage.getItem('token');
              if (token) config.headers.Authorization = `Bearer ${token}`;
              return config;
            });
            
            // Response interceptor: handle errors
            api.interceptors.response.use(
              (response) => response,
              (error) => {
                if (error.response?.status === 401) {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }
                return Promise.reject(error);
              }
            );
            ```
        * **`queryClient.ts`**: TanStack Query client configuration (staleTime, cacheTime, retry logic).
            * **Template:**
            ```typescript
            import { QueryClient } from '@tanstack/react-query';
            
            export const queryClient = new QueryClient({
              defaultOptions: {
                queries: {
                  staleTime: 1000 * 60 * 5, // 5 minutes
                  retry: 1,
                },
              },
            });
            ```
    * **`src/types/`**: Global TypeScript interfaces/types shared across features.
        * **Examples:** `PageResponse<T>`, `ApiError`, `User`, `Customer`, `AuthToken`.
        * Do NOT put feature-specific types here. Use `features/{scope}/{module}/types/` instead.
    * **`src/routes/`**: React Router configuration.
        * **`AppRoutes.tsx`**: Main routing logic with route guards (protected routes).
        * Split by scope if needed: `BackofficeRoutes.tsx`, `StorefrontRoutes.tsx`.
    * **`src/layouts/`**: Layout components (Shell/Wrapper components).
        * **`layouts/backoffice/`**: Ant Design layouts (Sidebar, Header, MainLayout).
        * **`layouts/storefront/`**: Mantine layouts (Navbar, Footer, MainLayout).
    * **`src/components/`**: Global reusable components (NOT feature-specific).
        * **`components/backoffice/`**: Shared Ant Design components (e.g., `DataTable`, `PageHeader`).
        * **`components/storefront/`**: Shared Mantine components (e.g., `ProductCard`, `CartIcon`).
    * **`src/shared/utils/`**: Utility functions (formatters, validators, constants).
        * **Examples:** `formatCurrency`, `validateEmail`, `API_ENDPOINTS`, `formatDate`, `formatPhone`.
        * **Peru-specific:** `formatDNI`, `formatRUC`, `validateDNI` (8 digits), `validateCE` (Carné de Extranjería).
        * Use for cross-cutting logic shared across ALL features (not feature-specific).
    * **`src/stores/`**: Zustand global state stores.
        * **`stores/backoffice/`**: Admin session state (e.g., `useAuthStore`).
        * **`stores/storefront/`**: Customer session state (e.g., `useCartStore`, `useCustomerAuthStore`).

* **Scopes:**
    * `backoffice`: Admin panel logic.
    * `storefront`: Customer facing logic.

* **Module Anatomy:**
    Inside `src/features/backoffice/catalog/` (example):
    * `api/`: Axios functions (e.g., `getProducts`, `createProduct`).
    * `components/`: UI-only components (The "Views").
    * `hooks/`: Custom hooks containing logic & mutations (The "Brains").
    * `pages/`: Route entry points (Layout + Integration).
    * `constants/`: Feature-specific constants (e.g., `PRODUCT_STATUSES`, `API_ENDPOINTS`).
    * `utils/`: Feature-specific utilities (e.g., `calculateDiscount`, `validateSKU`).
    * `types/` (Optional): Feature-specific interfaces if not in global types.
    * `index.ts`: Public API of the module (see Section 2.1).

### 2.1. Module Public API (`index.ts`)
Each feature module MUST export only what is needed by other modules. This enforces encapsulation.

**What to Export:**
* Pages (for routing).
* Public hooks (if reusable).
* Public types (if shared).

**What NOT to Export:**
* Internal components (keep them private).
* API functions (only hooks should consume them).
* Utils (unless explicitly needed outside).

**Example (`features/backoffice/catalog/index.ts`):**
```typescript
// Public Pages (for Router)
export { ProductListPage } from './pages/ProductListPage';
export { ProductDetailPage } from './pages/ProductDetailPage';

// Public Hooks (if reusable)
export { useProductList } from './hooks/useProductList';

// Public Types (if shared)
export type { Product, ProductFormData } from './types';
```

## 3. UI Libraries Strategy (STRICT)
Based on the `features` folder structure:
* **`features/backoffice/**`**: MUST use **Ant Design v6** (`antd`).
    * Icons: `@tabler/icons-react`.
* **`features/storefront/**`**: MUST use **Mantine v8** (`@mantine/core`).
    * Styles: Use CSS Modules or Mantine style props. Do NOT use Emotion/Styled-Components.
    * Icons: `@tabler/icons-react`.

## 3.1. UI/UX Design Guidelines
**CRITICAL: All user-facing content MUST be in Spanish.**

### A. Language & Content Rules
* **Code:** Variables, functions, comments in English.
* **User Interface:** ALL text visible to users MUST be in Spanish:
    * Labels: "Nombre de usuario", "Contraseña", "Correo electrónico"
    * Buttons: "Iniciar sesión", "Guardar", "Cancelar", "Eliminar"
    * Messages: "Usuario creado exitosamente", "Error al guardar los datos"
    * Placeholders: "Ingrese su correo", "Buscar productos..."
    * Validations: "Este campo es requerido", "Formato de correo inválido"
    * Tables: "Nombre", "Acciones", "Fecha de creación"
* **Exception:** Technical logs and error codes in console can be in English.

### B. CSS Reset & Global Styles
**Base reset in `src/index.css` (MANDATORY):**
```css
/* CSS Reset */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.5;
  font-weight: 400;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-height: 100vh;
}

#root {
  min-height: 100vh;
}
```

### C. Design Principles (MANDATORY)
**Visual Identity: Elegant, Professional, Modern, Minimalist**

1. **Color Palette:**
   * Primary: Professional blues/teals (e.g., `#1677ff` Ant Design primary)
   * Neutral: Grays for text/backgrounds (`#000`, `#595959`, `#f0f0f0`, `#fff`)
   * Semantic: Success (green), Error (red), Warning (orange), Info (blue)
   * Use library defaults (Ant Design / Mantine) unless branding requires override

2. **Typography:**
   * Font: System fonts or 'Inter' (clean, modern)
   * Hierarchy: Clear sizes (h1: 32px, h2: 24px, h3: 20px, body: 14-16px)
   * Weight: Regular (400) for body, Medium (500) for emphasis, Bold (600-700) for headings
   * Line height: 1.5 for readability

3. **Spacing:**
   * Consistent: Use multiples of 4px or 8px (4, 8, 12, 16, 24, 32, 48, 64)
   * Breathing room: Avoid cramped layouts
   * Whitespace: Embrace negative space for minimalist feel

4. **Components:**
   * **Clean:** Minimal borders, subtle shadows
   * **Rounded corners:** 4-8px border-radius (modern)
   * **Hover states:** Subtle transitions (200-300ms)
   * **Focus states:** Clear focus indicators for accessibility

5. **Layout:**
   * **Grid-based:** Consistent alignment
   * **Responsive:** Mobile-first approach
   * **Card-based:** Use cards for content grouping (subtle elevation)

6. **Icons:**
   * **Consistent:** Same library throughout (Tabler for both, backoffice and storefront)
   * **Size:** 16-24px for inline, 32-48px for prominent actions
   * **Color:** Match text color or primary color

### D. Styling Conventions
**Backoffice (Ant Design):**
* Use Ant Design components as-is (don't override heavily)
* Theme: Professional, dashboard-like
* Density: Comfortable (not too compact)

**Storefront (Mantine):**
* Use Mantine components with custom styling via props or CSS Modules
* Theme: Customer-friendly, approachable
* Density: Spacious, easy to interact

**CSS Modules (when needed):**
```css
/* ProductCard.module.css */
.card {
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
}
```

## 4. Pattern: Logic/UI Separation (The "Hook" Pattern)
We replace the old Container/View pattern with the **Custom Hook Pattern**.

### A. The API Layer (`api/x.api.ts`)
* Contains **only** Axios calls.
* Returns `Promise<T>`.
* **Naming:** `getRecipes`, `createRecipe`. NO `fetchData`.
* **Example:**
    ```typescript
    export const getProducts = async (): Promise<PageResponse<Product>> => {
        const { data } = await api.get('/products');
        return data;
    };
    ```

### B. The Brain (`hooks/useX.ts`)
* Contains **ALL** business logic, state, and side effects.
* Uses **TanStack Query** (`useQuery`, `useMutation`).
* Manages `isLoading`, `isError`, `toasts`, and form submission handlers.
* **Returns:** An object with data and handlers needed by the UI.
* **Example:**
    ```typescript
    export const useProductList = () => {
        const query = useQuery({ queryKey: ['products'], queryFn: getProducts });
        const handleDelete = (id: number) => { ... };
        return { ...query, handleDelete };
    };
    ```

### C. The View (`components/XList.tsx`)
* **The "Dumb" Component.**
* Receives data via Props OR calls the custom hook (The Brain).
* Contains **NO** `useEffect` or direct Axios calls.
* Renders strict UI using the designated library (AntD or Mantine).
* **Example:**
    ```tsx
    export const ProductList = () => {
        const { data, isLoading, handleDelete } = useProductList(); // Connects to Brain
        if (isLoading) return <Loader />;
        return <Table dataSource={data} ... />; // Ant Design
    };
    ```

### D. The Assembler (`pages/XPage.tsx`)
* Defines the Page Layout (Title, Breadcrumbs).
* Mounts the main component(s).
* **Example:**
    ```tsx
    export const ProductListPage = () => {
        return (
            <PageHeader title="Products">
                <ProductList />
            </PageHeader>
        );
    };
    ```


## 5. Naming Conventions
* **Files:**
    * Components: PascalCase (e.g., `ProductList.tsx`, `UserCard.tsx`).
    * Hooks: camelCase with `use` prefix (e.g., `useProductList.ts`, `useAuth.ts`).
    * API functions: camelCase (e.g., `getProducts.ts`, `createOrder.ts`).
    * Types: PascalCase (e.g., `Product.ts`, `User.ts`).
    * Utils: camelCase (e.g., `formatCurrency.ts`, `validateEmail.ts`).
* **Functions/Variables:**
    * camelCase (e.g., `handleSubmit`, `isLoading`, `productList`).
    * Event handlers: `handle{Action}` (e.g., `handleClick`, `handleSubmit`).
* **Interfaces/Types:**
    * PascalCase (e.g., `Product`, `UserFormData`).
    * Props interfaces: `{Component}Props` (e.g., `ProductListProps`).
* **Constants:** UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `MAX_RETRIES`).

## 6. Coding Standards
* **TypeScript:**
    * Use `interface` for Models (mirroring Backend DTOs).
    * Avoid `any`. Use `unknown` or specific types.
    * Props must be typed: `interface Props { ... }`.
* **Peru-Specific Validations:**
    * **DNI:** 8 numeric digits (e.g., `12345678`).
    * **CE (Carné de Extranjería):** 9-12 alphanumeric characters.
    * **Phone:** Peru format (9 digits starting with 9, e.g., `987654321`).
    * **Ubigeo:** Always use IDs from `ubigeos` table (department, province, district).
    * **Currency:** Peruvian Sol (PEN). Format: `S/ 1,234.56`.
* **Global State:**
    * Use **Zustand** stores (`src/stores/`) only for global session data (Auth, Cart, UI Theme).
    * Do NOT put API data in Zustand (use React Query cache for that).
* **SOLID/DRY Principles:**
    * **SRP:** Each component/hook has ONE responsibility. Separate logic (hooks) from UI (components).
    * **DRY:** Extract repeated logic to custom hooks or utils. Do NOT copy-paste code.
    * **Example (BAD):**
        ```tsx
        // ProductList.tsx - Logic mixed with UI ❌
        const [products, setProducts] = useState([]);
        useEffect(() => { axios.get('/products').then(...); }, []);
        ```
    * **Example (GOOD):**
        ```tsx
        // hooks/useProductList.ts - Logic separated ✅
        export const useProductList = () => {
            return useQuery({ queryKey: ['products'], queryFn: getProducts });
        };
        
        // components/ProductList.tsx - Pure UI ✅
        const { data } = useProductList();
        ```
* **Imports:**
    * Use relative paths (e.g., `../../hooks/useAuth`). Path aliases (`@/`) are NOT configured in this project.
    * Do NOT duplicate logic. If it's shared, move to `src/hooks` or `src/components`.
* **Forms & Validation:**
    * Use React Hook Form + Zod for form validation.
    * Define Zod schema, use `zodResolver`.
    * **Example:**
        ```tsx
        const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
        const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) });
        ```
* **Error Handling (MANDATORY):**
    * **API Errors:** Always wrap mutations in try-catch blocks.
    * **User Feedback:** Use Ant Design `message` (backoffice) or Mantine `notifications` (storefront) for error messages.
    * **Error Messages:** MUST be in Spanish and user-friendly (avoid technical jargon).
    * **Backend Errors:** Extract message from `error.response?.data?.message` or provide fallback.
    * **Example:**
        ```tsx
        try {
          await loginMutation.mutateAsync(values);
          message.success('Inicio de sesión exitoso');
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          message.error(err.response?.data?.message || 'Error al iniciar sesión');
        }
        ```
    * **Loading States:** Always disable buttons during mutation with `loading` prop.
    * **Validation Errors:** Show inline validation messages in Spanish below form fields.

## 7. Quality Assurance
* **Package Manager:** Always use `pnpm` commands, NOT `npm` or `yarn`.
* **Linter:** Before outputting code, ensure it follows ESLint rules (no unused vars).
* **Build:** Ensure the code provided is syntactically correct and would pass `tsc` (TypeScript Compiler).

## 8. Error Recovery Strategy
**When errors occur during development, follow this priority:**

1. **File Existence Check:**
   - Use `file_search` or `read_file` to verify files exist before debugging imports
   - DO NOT assume files were created successfully

2. **Import Path Verification:**
   - Verify relative paths are correct from the importing file's location
   - Count `../` levels carefully
   - Remember: NO extensions, NO aliases

3. **Compilation Errors:**
   - Run `pnpm run build` to see TypeScript errors
   - Fix actual code issues FIRST (undefined vars, wrong types)
   - Do NOT modify tsconfig.json as first solution

4. **Module Not Found:**
   - Check if the imported file exists
   - Check if the file has the correct export
   - Verify the relative path is correct
   - Only THEN consider configuration issues

5. **Stop Infinite Loops:**
   - If same error persists after 3 attempts, STOP
   - Report the issue clearly to user
   - Suggest manual verification
   - DO NOT keep trying random solutions

**NEVER:**
- Modify `tsconfig.json` without understanding the root cause
- Delete `node_modules` or cache without verification
- Keep trying different import syntaxes in a loop
- Change build scripts without explicit user request
- Use `npm` or `yarn` commands (this project uses `pnpm`)
- Modify or delete `pnpm-lock.yaml` without explicit user request
