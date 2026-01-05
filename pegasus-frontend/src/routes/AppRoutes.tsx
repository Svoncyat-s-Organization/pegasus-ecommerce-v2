import { Routes, Route, Navigate } from 'react-router-dom';
import { BackofficeLayout } from '@layouts/backoffice';
import { StorefrontLayout } from '@layouts/storefront';
import { BackofficeProtectedRoute } from '@routes/BackofficeProtectedRoute';
import { StorefrontProtectedRoute } from '@routes/StorefrontProtectedRoute';

// Backoffice Pages
import { LoginPage as AdminLoginPage } from '@features/backoffice/auth/pages/LoginPage';
import { UsersListPage } from '@features/backoffice/security';
import { RolesPermissionsPage } from '@features/backoffice/security/rbac';
import { CustomersListPage } from '@features/backoffice/customer';
import { BrandsListPage, CategoriesListPage, ProductsListPage, ProductFormPage } from '@features/backoffice/catalog';
import { ShippingMethodsListPage, ShipmentsListPage } from '@features/backoffice/logistic';
import { OrderListPage } from '@features/backoffice/order';
import { RmaListPage } from '@features/backoffice/rma';

// Storefront Pages
import { HomePage } from '@features/storefront/home/pages/HomePage';

// Temporary placeholder pages
const DashboardPage = () => (
  <div style={{ padding: '24px' }}>
    <h1 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: 600 }}>Dashboard</h1>
    <p style={{ color: '#666' }}>Panel de control principal del backoffice</p>
  </div>
);

const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <div style={{ padding: '24px' }}>
    <h1 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: 600 }}>{title}</h1>
    <p style={{ color: '#666' }}>{description}</p>
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
        <Route path="catalog/products" element={<ProductsListPage />} />
        <Route path="catalog/products/new" element={<ProductFormPage />} />
        <Route path="catalog/products/:id/edit" element={<ProductFormPage />} />
        <Route path="catalog/categories" element={<CategoriesListPage />} />
        <Route path="catalog/brands" element={<BrandsListPage />} />

        {/* Orders */}
        <Route path="orders" element={<OrderListPage />} />

        {/* Inventory */}
        <Route path="inventory/stock" element={<PlaceholderPage title="Stock" description="Gestión de stock e inventario" />} />
        <Route path="inventory/movements" element={<PlaceholderPage title="Movimientos" description="Registro de movimientos de inventario" />} />
        <Route path="inventory/warehouses" element={<PlaceholderPage title="Almacenes" description="Gestión de almacenes y bodegas" />} />

        {/* Purchases */}
        <Route path="purchases/suppliers" element={<PlaceholderPage title="Proveedores" description="Gestión de proveedores" />} />
        <Route path="purchases/orders" element={<PlaceholderPage title="Órdenes de Compra" description="Gestión de órdenes de compra" />} />

        {/* Logistics */}
        <Route path="logistics/shipping-methods" element={<ShippingMethodsListPage />} />
        <Route path="logistics/shipments" element={<ShipmentsListPage />} />
        <Route path="logistics/carriers" element={<PlaceholderPage title="Transportistas" description="Gestión de empresas transportistas" />} />

        {/* Invoices */}
        <Route path="invoices" element={<PlaceholderPage title="Facturación" description="Gestión de facturas y comprobantes" />} />

        {/* RMA / Returns */}
        <Route path="rma" element={<RmaListPage />} />

        {/* Customers */}
        <Route path="customers" element={<CustomersListPage />} />

        {/* Security (RBAC) */}
        <Route path="security/users" element={<UsersListPage />} />
        <Route path="security/roles" element={<RolesPermissionsPage />} />

        {/* Reports */}
        <Route path="reports" element={<PlaceholderPage title="Reportes" description="Generación de reportes y estadísticas" />} />

        {/* Settings */}
        <Route path="settings" element={<PlaceholderPage title="Configuración" description="Configuración general del sistema" />} />
      </Route>

      {/* ==================== STOREFRONT ROUTES ==================== */}
      {/* Public storefront routes */}
      <Route path="/" element={<StorefrontLayout />}>
        <Route path="home" element={<HomePage />} />
        <Route path="login" element={<PlaceholderPage title="Login Cliente" description="Inicia sesión con tu cuenta" />} />
        <Route path="register" element={<PlaceholderPage title="Registro" description="Crea tu cuenta de cliente" />} />
        <Route path="products" element={<PlaceholderPage title="Productos" description="Catálogo de productos" />} />
        <Route path="products/:id" element={<PlaceholderPage title="Detalle del Producto" description="Información del producto" />} />
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
        <Route path="cart" element={<PlaceholderPage title="Carrito" description="Tu carrito de compras" />} />
        <Route path="checkout" element={<PlaceholderPage title="Checkout" description="Finalizar compra" />} />
        <Route path="profile" element={<PlaceholderPage title="Mi Perfil" description="Perfil del usuario" />} />
        <Route path="orders" element={<PlaceholderPage title="Mis Pedidos" description="Historial de pedidos" />} />
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
