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
import { WarehouseListPage, StockListPage, MovementListPage } from '@features/backoffice/inventory';

// Storefront Pages
import { HomePage } from '@features/storefront/home/pages/HomePage';
import { LoginPage as CustomerLoginPage, RegisterPage } from '@features/storefront/auth';
import { ProductListPage, ProductDetailPage } from '@features/storefront/catalog';
import { CartPage } from '@features/storefront/cart';
import { CheckoutPage, OrderConfirmationPage } from '@features/storefront/checkout';

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
        <Route path="inventory/warehouses" element={<WarehouseListPage />} />
        <Route path="inventory/stock" element={<StockListPage />} />
        <Route path="inventory/movements" element={<MovementListPage />} />

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
        <Route index element={<HomePage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="login" element={<CustomerLoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        
        {/* Protected storefront routes (nested within same layout) */}
        <Route path="cart" element={
          <StorefrontProtectedRoute>
            <CartPage />
          </StorefrontProtectedRoute>
        } />
        <Route path="checkout" element={
          <StorefrontProtectedRoute>
            <CheckoutPage />
          </StorefrontProtectedRoute>
        } />
        <Route path="orders/confirmation/:orderId" element={
          <StorefrontProtectedRoute>
            <OrderConfirmationPage />
          </StorefrontProtectedRoute>
        } />
        <Route path="profile" element={
          <StorefrontProtectedRoute>
            <PlaceholderPage title="Mi Perfil" description="Perfil del usuario" />
          </StorefrontProtectedRoute>
        } />
        <Route path="orders" element={
          <StorefrontProtectedRoute>
            <PlaceholderPage title="Mis Pedidos" description="Historial de pedidos" />
          </StorefrontProtectedRoute>
        } />
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
