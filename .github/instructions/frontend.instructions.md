---
applyTo: "pegasus-frontend/**/*.ts, pegasus-frontend/**/*.tsx, pegasus-frontend/**/*.css, pegasus-frontend/package.json, pegasus-frontend/index.html, pegasus-frontend/vite.config.ts"
---

# Frontend Context: React 19 + Vite

## CRITICAL RULES (Read First)

**Peru Validations:** See `copilot-instructions.md` for DNI/CE/Phone/Currency/Ubigeo rules.

**Package Manager:** pnpm ONLY (NOT npm/yarn)

**Path Aliases (MANDATORY):**
```tsx
✅ import { api } from '@config/api';
✅ import type { User } from '@types';
✅ import { useAuthStore } from '@stores/backoffice/authStore';
❌ import { api } from '../../../../config/api';  // NO deep relative paths
```

**UI Libraries (STRICT):**
- `features/backoffice/**` → Ant Design v6
- `features/storefront/**` → Mantine v8
- **Icons:** Tabler Icons ONLY (`@tabler/icons-react`) for ALL modules
- **Design:** Professional, minimalist, NO bright gradients

**Language:**
- Code/variables/comments: English
- ALL user-facing text: Spanish

**Quality:**
- Code MUST compile without errors
- Run `pnpm run build` before submitting
- NO unused imports

**Page Titles (Browser Tab):**
- Maintain `PageTitle` component (`src/shared/components/PageTitle.tsx`) with mapping of routes to titles
- Format: Backoffice = `{Page} - Backoffice | Pegasus`, Storefront = `{Page} | Pegasus E-commerce`
- Update `pageTitles` object when adding new routes

---

## 1. Tech Stack

```json
{
  "core": "React 19 + TypeScript + Vite 7",
  "router": "React Router DOM v7",
  "state": {
    "server": "TanStack Query v5 (MANDATORY for API)",
    "client": "Zustand"
  },
  "http": "Axios (configured in src/config/api.ts)",
  "forms": "React Hook Form + Zod",
  "ui": {
    "backoffice": "Ant Design v6",
    "storefront": "Mantine v8"
  },
  "dates": "Day.js"
}
```

**Environment Variables:**
```bash
VITE_API_BASE_URL=http://localhost:8080/api  # REQUIRED
VITE_ENV=development                          # Optional
VITE_ENABLE_LOGS=true                         # Optional
```

**Path Aliases Config:**
```typescript
// tsconfig.app.json & vite.config.ts
{
  "@/*": "src/*",
  "@config/*": "src/config/*",
  "@types": "src/types/index.ts",
  "@stores/*": "src/stores/*",
  "@features/*": "src/features/*",
  "@shared/*": "src/shared/*"
}
```

---

## 2. Architecture: Package-by-Feature

**Structure:** `src/features/{scope}/{module}/`

```
src/
├── config/          # api.ts, queryClient.ts
├── types/           # Global interfaces
├── routes/          # Router config
├── layouts/         # backoffice/, storefront/
├── components/      # Shared components by scope
├── shared/utils/    # formatters.ts, validators.ts
├── stores/          # Zustand (auth, cart, sidebar)
└── features/
    ├── backoffice/  # Ant Design
    │   ├── auth/
    │   ├── catalog/
    │   ├── user/
    │   └── ...
    └── storefront/  # Mantine
        ├── auth/
        ├── cart/
        └── ...
```

**Module Anatomy:** `features/backoffice/catalog/`
```
catalog/
├── api/          # Axios calls (getProducts, createProduct)
├── hooks/        # Business logic (useProductList, useProductCreate)
├── components/   # UI-only (ProductList, ProductCard)
├── pages/        # Route entry points (ProductListPage)
├── constants/    # PRODUCT_STATUSES, etc.
├── utils/        # calculateDiscount, validateSKU
└── index.ts      # Public exports ONLY
```

**Initial Setup Order (Empty Project):**
1. Create `src/config/api.ts` + `queryClient.ts`
2. Create `src/types/index.ts`
3. Wrap App in `QueryClientProvider` (main.tsx)
4. Then create features

**Module Public API (index.ts):**
```tsx
// Export ONLY what's needed externally
export { ProductListPage } from './pages/ProductListPage';
export { useProductList } from './hooks/useProductList';
export type { Product } from './types';
// Components/API stay PRIVATE
```

---

## 3. Pattern: API → Hook → Component → Page

**A. API Layer** (`api/products.api.ts`)
```tsx
// Pure Axios calls, return Promise<T>
export const getProducts = async (): Promise<PageResponse<Product>> => {
  const { data } = await api.get('/products');
  return data;
};
```

**B. Hook (Business Logic)** (`hooks/useProductList.ts`)
```tsx
// ALL logic here: queries, mutations, state, handlers
export const useProductList = () => {
  const query = useQuery({ 
    queryKey: ['products'], 
    queryFn: getProducts 
  });
  
  const handleDelete = (id: number) => { /* mutation logic */ };
  
  return { ...query, handleDelete };
};
```

**C. Component (UI Only)** (`components/ProductList.tsx`)
```tsx
// Calls hook OR receives props, NO useEffect
export const ProductList = () => {
  const { data, isLoading, handleDelete } = useProductList();
  if (isLoading) return <Spin />;
  return <Table dataSource={data} />;
};
```

**D. Page (Layout)** (`pages/ProductListPage.tsx`)
```tsx
// Mounts component with layout
export const ProductListPage = () => (
  <Card>
    <Title level={2}>Productos</Title>
    <ProductList />
  </Card>
);
```

---

## 4. UI/UX Guidelines (CRITICAL)

### A. Language Rules
```tsx
✅ <Button>Guardar</Button>           // Spanish UI
✅ const userName = 'John';           // English code
✅ message.error('Usuario inválido'); // Spanish messages
❌ <Button>Save</Button>              // NO English in UI
```

### B. Layout Composition

**Rule:** Layout = spacing, Features = visual structure

```tsx
// ✅ CORRECT: Single card with all content
export const UsersListPage = () => (
  <Card>
    <Title level={2}>Usuarios</Title>
    <Search placeholder="Buscar..." />
    <Table columns={columns} dataSource={data} />
  </Card>
);

// ❌ WRONG: Layout should NOT have Card/background
<Content style={{ background: '#fff' }}>  // NO, let features decide
  <Outlet />
</Content>
```

### C. CRUD Module Structure (MANDATORY)

**ALL CRUD modules MUST include these components (minimum viable structure):**

```tsx
// ✅ CORRECT: Complete CRUD module structure
export const UsersListPage = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading } = useUsers(page, pageSize, debouncedSearch || undefined);

  return (
    <Card>
      {/* 1. HEADER: Title + Description */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>Usuarios</Title>
        <Text type="secondary">
          Gestión de usuarios del backoffice. Crea, edita y administra cuentas de staff.
        </Text>
      </div>

      {/* 2. SEARCH BAR + CREATE BUTTON */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <Input
          placeholder="Buscar por usuario, email o nombre..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
          allowClear
          style={{ maxWidth: 400 }}
        />
        <Button type="primary" icon={<IconPlus />} onClick={handleCreate}>
          Nuevo Usuario
        </Button>
      </div>

      {/* 3. TABLE with pagination and size selector */}
      <Table
        columns={columns}
        dataSource={data?.content || []}
        rowKey="id"
        loading={isLoading}
        bordered
        pagination={{
          current: page + 1,
          pageSize,
          total: data?.totalElements || 0,
          showSizeChanger: true,
          showTotal: (total) => \`Total: \${total} usuarios\`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />
    </Card>
  );
};
```

**CRUD Components Checklist:**
- ✅ **Card container** (single Card wrapping all content)
- ✅ **Header section:** Title (h2) + Description (secondary text)
- ✅ **Search bar:** Input with debounce (500ms), `allowClear`, resets page to 0
- ✅ **Create button:** Primary button with icon (IconPlus) aligned right
- ✅ **Table:** Bordered, with loading state, rowKey="id"
- ✅ **Pagination:** `current: page + 1` (backend 0-based, UI 1-based)
- ✅ **Size selector:** `showSizeChanger: true`
- ✅ **Total counter:** `showTotal` with Spanish text

**CRUD Actions in Table (Actions column, fixed right, width 120-150):**
- **CREATE:** Top-right button "Nuevo {Entity}"
- **READ:** Entire table + optional view icon (IconEye) for details
- **UPDATE:** IconEdit in Actions column
- **DELETE:** IconTrash with Popconfirm in Actions column

**Exceptions (NO search/pagination/create button):**
- **Read-only modules:** Dashboard (graphs/KPIs), Reports, Kardex (movement history)
- **Non-CRUD modules:** Settings, Profile

### D. Table Columns (MAX 5-7)

**MANDATORY First Column:** `#` (row number)

```tsx
const columns = [
  { 
    title: '#', 
    key: 'index',
    width: 60,
    render: (_, __, index) => index + 1,  // Row number
  },
  { title: 'Usuario', dataIndex: 'username' },
  { title: 'Nombre', render: (r) => `${r.firstName} ${r.lastName}` },
  { title: 'Email', dataIndex: 'email' },
  { title: 'Estado', dataIndex: 'status', render: (s) => <Tag>{s}</Tag> },
  { title: 'Acciones', key: 'actions', fixed: 'right', width: 120 },
];
```

**What NOT to show:** Document numbers, full addresses, creation dates → View modal

### D. Search + Pagination (MANDATORY)

```tsx
// State
const [page, setPage] = useState(0);
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

// Query
const { data } = useUsers(page, 10, debouncedSearch || undefined);

// UI
<Input
  placeholder="Buscar por usuario, email o nombre..."
  value={searchTerm}
  onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
  allowClear
/>

<Table
  pagination={{
    current: page + 1,  // Backend = 0-based, UI = 1-based
    total: data?.totalElements,
    onChange: (newPage) => setPage(newPage - 1),
  }}
/>
```

**Column Width Guidelines:**
- **# (row number):** `width: 60`
- **Actions:** `width: 120`
- **Status/Tags:** `width: 100-120`
- **Phone (formatted):** `width: 160` (to fit `+51 999 999 999`)
- **Email:** `width: 200-250`
- **Names/Short text:** No width constraint (flexible)
- **Others colums**: Adjust as needed

### E. Action Buttons (MAX 3 icons)

```tsx
// ✅ CORRECT: Self-descriptive, no text
<Space size="small">
  <Button type="link" size="small" icon={<IconEye size={16} />} />
  <Button type="link" size="small" icon={<IconEdit size={16} />} />
  <Popconfirm title="¿Eliminar?" onConfirm={handleDelete}>
    <Button type="link" danger size="small" icon={<IconTrash size={16} />} />
  </Popconfirm>
</Space>
```

### F. Modal vs Full Page

**Modal:** ≤8 fields (Users, Roles)  
**Full Page:** >8 fields OR complex workflows (Products with variants)

```tsx
// Modal Example
<Modal title="Crear Usuario" open={visible} onOk={() => form.submit()}>
  <Form form={form} layout="vertical">
    <Form.Item label="Usuario" name="username"><Input /></Form.Item>
    {/* 4-8 fields max */}
  </Form>
</Modal>
```

### G. Form Layout

**RULE:** Use Row/Col grid layout. NEVER use monotonous single-column vertical layouts.

```tsx
// ✅ CORRECT: Varied layout with Row/Col
<Form form={form} layout="vertical">
  <Row gutter={16}>
    <Col span={12}>
      <Form.Item label="Usuario" name="username"><Input /></Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item label="Email" name="email"><Input /></Form.Item>
    </Col>
  </Row>
  
  <Row gutter={16}>
    <Col span={12}>
      <Form.Item label="Nombre" name="firstName"><Input /></Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item label="Apellido" name="lastName"><Input /></Form.Item>
    </Col>
  </Row>
  
  <Row gutter={16}>
    <Col span={8}>
      <Form.Item label="Tipo Doc" name="docType"><Select /></Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item label="Número" name="docNumber"><Input /></Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item label="Teléfono" name="phone"><Input /></Form.Item>
    </Col>
  </Row>
  
  <Form.Item label="Dirección" name="address"><Input /></Form.Item>
</Form>

// ❌ WRONG: All fields stacked vertically
<Form form={form} layout="vertical">
  <Form.Item label="Usuario" name="username"><Input /></Form.Item>
  <Form.Item label="Email" name="email"><Input /></Form.Item>
  <Form.Item label="Nombre" name="firstName"><Input /></Form.Item>
  <Form.Item label="Apellido" name="lastName"><Input /></Form.Item>
  {/* ... monotonous, wastes space */}
</Form>
```

**Column Span Guidelines:**
- **span={12}:** Paired fields (username/email, firstName/lastName)
- **span={8}:** Triple fields (docType/docNumber/phone)
- **span={6}:** Quadruple fields (dates, short codes)
- **span={24}:** Full-width (long text, addresses, descriptions)
- **gutter={16}:** Standard spacing between columns

### H. Peru Ubigeo Fields (CRITICAL)

**RULE:** NEVER use manual input for ubigeo. ALWAYS use 3 cascading selectors.

```tsx
// ✅ CORRECT: 3 cascading Select components
const [selectedDepartment, setSelectedDepartment] = useState<string>();
const [selectedProvince, setSelectedProvince] = useState<string>();

const { data: departments } = useDepartments();
const { data: provinces } = useProvinces(selectedDepartment);
const { data: districts } = useDistricts(selectedProvince);

<Row gutter={16}>
  <Col span={8}>
    <Form.Item label="Departamento" name="department" rules={[{ required: true }]}>
      <Select
        options={departments?.map(d => ({ label: d.name, value: d.id }))}
        onChange={(value) => {
          setSelectedDepartment(value);
          setSelectedProvince(undefined);
          form.setFieldsValue({ province: undefined, district: undefined });
        }}
        showSearch
        optionFilterProp="label"
      />
    </Form.Item>
  </Col>
  <Col span={8}>
    <Form.Item label="Provincia" name="province" rules={[{ required: true }]}>
      <Select
        disabled={!selectedDepartment}
        options={provinces?.map(p => ({ label: p.name, value: p.id }))}
        onChange={(value) => {
          setSelectedProvince(value);
          form.setFieldsValue({ district: undefined });
        }}
        showSearch
        optionFilterProp="label"
      />
    </Form.Item>
  </Col>
  <Col span={8}>
    <Form.Item label="Distrito" name="district" rules={[{ required: true }]}>
      <Select
        disabled={!selectedProvince}
        options={districts?.map(d => ({ label: d.name, value: d.id }))}
        showSearch
        optionFilterProp="label"
      />
    </Form.Item>
  </Col>
</Row>

// ❌ WRONG: Manual 6-digit input
<Form.Item label="Ubigeo" name="ubigeoId">
  <Input placeholder="150101" maxLength={6} />  // NO
</Form.Item>
```

**API Integration:**
- **Departments:** `GET /api/locations/departments` (25 departments)
- **Provinces:** `GET /api/locations/provinces/{departmentId}` (196 provinces)
- **Districts:** `GET /api/locations/districts/{provinceId}` (1866 districts)
- **Hooks:** `useDepartments()`, `useProvinces(deptId)`, `useDistricts(provId)`
- **Storage:** Final district.id (6 digits) = ubigeoId for backend

### I. Design Principles

**Colors:** Professional blues/grays, semantic colors for status  
**Typography:** System fonts, clear hierarchy (h1: 32px, h2: 24px, body: 14-16px)  
**Spacing:** Multiples of 4px/8px  
**Components:** Minimal borders, 4-8px border-radius, subtle shadows  
**NO:** Bright gradients, excessive animations, flashy designs

---

## 5. Coding Standards

### A. TypeScript
```tsx
interface UserProps { id: number; name: string; }  // Use interface
const data: Product[] = [];  // Explicit types
type Status = 'active' | 'inactive';  // Union types
❌ const data: any = [];  // NO any
```

### B. State Management

**Server State:** TanStack Query (API data)  
**Client State:** Zustand (auth, cart, UI)

```tsx
// ❌ WRONG: API data in component state
const [products, setProducts] = useState([]);
useEffect(() => { axios.get('/products').then(...); }, []);

// ✅ CORRECT: API data in React Query
const { data } = useQuery({ queryKey: ['products'], queryFn: getProducts });
```

### C. Forms + Validation

```tsx
const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) });
```

### D. Error Handling (MANDATORY)

```tsx
// In mutations
try {
  await loginMutation.mutateAsync(values);
  message.success('Inicio de sesión exitoso');
} catch (error: unknown) {
  const err = error as { response?: { data?: { message?: string } } };
  message.error(err.response?.data?.message || 'Error al iniciar sesión');
}

// Loading states
<Button loading={mutation.isPending}>Guardar</Button>
```

### E. Naming Conventions

**Files:** PascalCase components, camelCase hooks/utils  
**Functions:** camelCase, `handle{Action}` for events  
**Constants:** UPPER_SNAKE_CASE  
**Interfaces:** PascalCase, `{Component}Props`

---

## 6. Testing (Write ONLY when requested)

**Location:** Colocate (ProductList.test.tsx next to ProductList.tsx)

```tsx
// Unit Test (Vitest)
import { formatCurrency } from './formatters';
expect(formatCurrency(1234.56)).toBe('S/ 1,234.56');

// Integration Test (React Testing Library)
import { render, screen, fireEvent } from '@testing-library/react';
render(<LoginForm />);
fireEvent.click(screen.getByText('Iniciar sesión'));
expect(screen.getByText('Cargando...')).toBeInTheDocument();
```

**Coverage:** 70% for critical paths (auth, checkout)

---

## 7. Logging

```tsx
// Development only
if (import.meta.env.DEV) {
  console.info('Component mounted');
}

// Production: ONLY console.error
console.error('API Error:', { endpoint, status, message });

// Best Practices
✅ console.error('Login failed:', error);
❌ console.log(token);  // NO sensitive data
```

---

## 8. Error Recovery

**Priority:**
1. **File Existence:** Use file_search to verify files exist
2. **Path Aliases:** ALWAYS use `@config/*` (NOT `../../../../config`)
3. **Compilation:** Run `pnpm run build`, fix code issues FIRST
4. **Module Not Found:** Check file exists → check export → verify alias
5. **Stop After 3 Attempts:** Report issue, don't loop

**NEVER:**
- Modify tsconfig.json without understanding root cause
- Delete node_modules without verification
- Use npm/yarn (project uses pnpm)
- Modify pnpm-lock.yaml

---

## 9. Troubleshooting (Quick Reference)

| Error | Cause | Solution |
|-------|-------|----------|
| Cannot find module '@config/api' | Alias not configured | Check tsconfig.app.json + vite.config.ts |
| QueryClient not found | Missing provider | Wrap App with QueryClientProvider |
| Axios 401 | Token expired | Check localStorage, verify interceptor |
| Type 'X' not assignable | Type mismatch | Check interface, use type assertion |
| Ant Design styles not loading | Missing import | Add `import 'antd/dist/reset.css'` |
| Network Error | Backend down | Start backend, check VITE_API_BASE_URL |

**React Query Issues:**
- Query key must be array: `['users']` NOT `'users'`
- Mutations need queryClient: `useMutation({ mutationFn, onSuccess: () => queryClient.invalidateQueries(['users']) })`

**State Issues:**
- Not persisting: Verify Zustand store is global, check persist middleware
- useAuthStore not a function: Export as `export default useAuthStore`

**Build Errors:**
- Failed to resolve import: Run `pnpm install`
- Cannot use import outside module: Check `type: "module"` in package.json

---

## 10. Quality Checklist

Before submitting code:

- [ ] Code compiles: `pnpm run build`
- [ ] No linter errors: `pnpm run lint`
- [ ] Path aliases used (NO deep relative paths)
- [ ] All UI text in Spanish
- [ ] Tables have # column first (row numbers)
- [ ] Search + pagination implemented
- [ ] Loading states on buttons
- [ ] Error handling with try-catch + messages
- [ ] No unused imports
- [ ] Types defined (NO `any`)
- [ ] Icons from Tabler ONLY

---

## Appendix: Config Templates

### api.ts (Axios)
```tsx
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

### queryClient.ts (React Query)
```tsx
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      retry: 1,
    },
  },
});
```

### useDebounce Hook
```tsx
import { useState, useEffect } from 'react';

export const useDebounce = <T,>(value: T, delay = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```
