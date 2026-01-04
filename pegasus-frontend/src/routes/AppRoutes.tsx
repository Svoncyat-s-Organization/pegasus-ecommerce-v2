import { Routes, Route, Navigate } from 'react-router-dom';
import { BackofficeLayout } from '@layouts/backoffice';
import { StorefrontLayout } from '@layouts/storefront';
import { BackofficeProtectedRoute } from '@routes/BackofficeProtectedRoute';
import { StorefrontProtectedRoute } from '@routes/StorefrontProtectedRoute';

// Backoffice Pages
import { LoginPage as AdminLoginPage } from '@features/backoffice/auth/pages/LoginPage';

// Storefront Pages
import { HomePage } from '@features/storefront/home/pages/HomePage';

// Temporary placeholder pages
const DashboardPage = () => (
  <div>
    <h1>Dashboard</h1>
    <p>Panel de control principal del backoffice</p>
  </div>
);

const CatalogProductsPage = () => (
  <div>
    <h1>Productos</h1>
    <p>Gestión de productos</p>
  </div>
);

const InventoryStockPage = () => (
  <div>
    <h1>Stock</h1>
    <p>Gestión de stock</p>
  </div>
);

const CustomersPage = () => (
  <div>
    <h1>Clientes</h1>
    <p>Gestión de clientes</p>
  </div>
);

const SecurityUsersPage = () => (
  <div>
    <h1>Usuarios</h1>
    <p>Gestión de usuarios del sistema</p>
  </div>
);

const SecurityRolesPage = () => (
  <div>
    <h1>Roles</h1>
    <p>Gestión de roles</p>
  </div>
);

const SecurityPermissionsPage = () => (
  <div>
    <h1>Permisos</h1>
    <p>Asignación de permisos</p>
  </div>
);

const ReportsPage = () => (
  <div>
    <h1>Reportes</h1>
    <p>Generación de reportes</p>
  </div>
);

const SettingsPage = () => (
  <div>
    <h1>Configuración</h1>
    <p>Configuración general del sistema</p>
  </div>
);

const StorefrontLoginPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Login Cliente</h1>
    <p>Página de login para clientes (storefront)</p>
  </div>
);

const ProfilePage = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Mi Perfil</h1>
    <p>Perfil del usuario</p>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* ==================== BACKOFFICE ROUTES ==================== */}
      {/* Public backoffice routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected backoffice routes */}
      <Route
        path="/admin"
        element={
          <BackofficeProtectedRoute>
            <BackofficeLayout />
          </BackofficeProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Catalog */}
        <Route path="catalog/products" element={<CatalogProductsPage />} />
        <Route
          path="catalog/categories"
          element={<div>Categorías (TODO)</div>}
        />
        <Route path="catalog/brands" element={<div>Marcas (TODO)</div>} />

        {/* Inventory */}
        <Route path="inventory/stock" element={<InventoryStockPage />} />
        <Route
          path="inventory/movements"
          element={<div>Movimientos (TODO)</div>}
        />
        <Route
          path="inventory/warehouses"
          element={<div>Almacenes (TODO)</div>}
        />

        {/* Customers */}
        <Route path="customers" element={<CustomersPage />} />

        {/* Security (RBAC) */}
        <Route path="security/users" element={<SecurityUsersPage />} />
        <Route path="security/roles" element={<SecurityRolesPage />} />
        <Route
          path="security/permissions"
          element={<SecurityPermissionsPage />}
        />

        {/* Reports */}
        <Route path="reports" element={<ReportsPage />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* ==================== STOREFRONT ROUTES ==================== */}
      {/* Public storefront routes */}
      <Route path="/" element={<StorefrontLayout />}>
        <Route path="home" element={<HomePage />} />
        <Route path="login" element={<StorefrontLoginPage />} />
        <Route path="register" element={<div>Registro (TODO)</div>} />
        <Route path="products" element={<div>Productos (TODO)</div>} />
        <Route path="products/:id" element={<div>Detalle Producto (TODO)</div>} />
        <Route path="cart" element={<div>Carrito (TODO)</div>} />
      </Route>

      {/* Protected storefront routes */}
      <Route
        path="/"
        element={
          <StorefrontProtectedRoute>
            <StorefrontLayout />
          </StorefrontProtectedRoute>
        }
      >
        <Route path="profile" element={<ProfilePage />} />
        <Route path="orders" element={<div>Mis Pedidos (TODO)</div>} />
        <Route path="favorites" element={<div>Favoritos (TODO)</div>} />
        <Route path="settings" element={<div>Configuración (TODO)</div>} />
      </Route>

      {/* 404 Not Found */}
      <Route
        path="*"
        element={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>404 - Página no encontrada</h1>
            <p>La página que buscas no existe.</p>
          </div>
        }
      />
    </Routes>
  );
};
