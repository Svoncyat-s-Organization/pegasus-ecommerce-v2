---
applyTo: "**/*.ts, **/*.tsx, package.json, index.html, vite.config.ts"
---

# 🦅 Frontend Context: React 19 + Vite

## 1. Tech Stack (from package.json)
* **Core:** React 19, TypeScript, Vite 7.
* **Router:** React Router DOM v7 (Use strict typed routes).
* **State Management:**
    * **Server State:** TanStack Query (React Query) v5. **MANDATORY for API calls.**
    * **Global Client State:** Zustand.
* **HTTP Client:** Axios (configured in `src/config/api.ts`).
* **Forms:** React Hook Form + Zod (`@hookform/resolvers`).
* **UI Libraries (STRICT):**
    * `features/backoffice/**` -> **MUST** use **Ant Design** (`antd`). Ant Design is strictly for Backoffice Staff UIs.
    * `features/storefront/**` -> **MUST** use **Mantine** (`@mantine/core`). Mantine is strictly for Storefront Customer UIs.
    * **Icons:** Tabler Icons (`@tabler/icons-react`).
* **Dates:** Day.js.

## 2. Architectural Style: Package-by-Feature
**STRICT RULE:** Organize code by **Domain Feature**, split by User Scope.

**Directory Structure:**
`src/features/{scope}/{module}/`

* **Scopes:**
    * `backoffice`: Admin panel logic.
    * `storefront`: Customer facing logic.
* **Module Anatomy:**
    Inside `src/features/backoffice/catalog/` (example):
    * `api/`: Axios functions (e.g., `getProducts`, `createProduct`).
    * `components/`: UI-only components (The "Views").
    * `hooks/`: Custom hooks containing logic & mutations (The "Brains").
    * `pages/`: Route entry points (Layout + Integration).
    * `types/` (Optional): Feature-specific interfaces if not in global types.
    * `index.ts`: Public API of the module.

## 3. UI Libraries Strategy (STRICT)
Based on the `features` folder structure:
* **`features/backoffice/**`**: MUST use **Ant Design v6** (`antd`).
    * Icons: `@ant-design/icons`.
* **`features/storefront/**`**: MUST use **Mantine v8** (`@mantine/core`).
    * Styles: Use CSS Modules or Mantine style props. Do NOT use Emotion/Styled-Components.
    * Icons: `@tabler/icons-react`.

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


## 5. Coding Standards
* **TypeScript:**
    * Use `interface` for Models (mirroring Backend DTOs).
    * Avoid `any`. Use `unknown` or specific types.
    * Props must be typed: `interface Props { ... }`.
* **Global State:**
    * Use **Zustand** stores (`src/stores/`) only for global session data (Auth, Cart, UI Theme).
    * Do NOT put API data in Zustand (use React Query cache for that).
* **Imports:**
    * Use absolute paths if configured (`@/features/...`) or clean relative paths.
    * Do NOT duplicate logic. If it's shared, move to `src/hooks` or `src/components`.

## 6. Quality Assurance
* **Linter:** Before outputting code, ensure it follows ESLint rules (no unused vars).
* **Build:** Ensure the code provided is syntactically correct and would pass `tsc` (TypeScript Compiler).
