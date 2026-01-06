import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  // Backoffice
  '/admin/dashboard': 'Dashboard',
  '/admin/catalog': 'Catálogo',
  '/admin/catalog/products': 'Productos',
  '/admin/catalog/categories': 'Categorías',
  '/admin/catalog/brands': 'Marcas',
  '/admin/orders': 'Pedidos',
  '/admin/inventory': 'Inventario',
  '/admin/inventory/stock': 'Stock',
  '/admin/inventory/movements': 'Movimientos',
  '/admin/inventory/warehouses': 'Almacenes',
  '/admin/purchases': 'Compras',
  '/admin/purchases/suppliers': 'Proveedores',
  '/admin/purchases/orders': 'Órdenes de Compra',
  '/admin/logistics': 'Logística',
  '/admin/logistics/shipping-methods': 'Métodos de Envío',
  '/admin/logistics/shipments': 'Envíos',
  '/admin/logistics/carriers': 'Transportistas',
  '/admin/invoices': 'Facturación',
  '/admin/invoices/invoices': 'Facturación - Comprobantes',
  '/admin/invoices/payments': 'Facturación - Pagos',
  '/admin/invoices/series': 'Facturación - Series',
  '/admin/invoices/payment-methods': 'Facturación - Métodos de pago',
  '/admin/rma': 'Devoluciones',
  '/admin/customers': 'Clientes',
  '/admin/security': 'Seguridad',
  '/admin/security/users': 'Usuarios',
  '/admin/security/roles': 'Roles y Permisos',
  '/admin/reports': 'Reportes',
  '/admin/settings': 'Configuración',
  '/admin/login': 'Iniciar Sesión',
  
  // Storefront
  '/': 'Inicio',
  '/home': 'Inicio',
  '/products': 'Productos',
  '/cart': 'Carrito',
  '/checkout': 'Checkout',
  '/login': 'Iniciar Sesión',
  '/register': 'Registrarse',
  '/profile': 'Mi Perfil',
};

export const PageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let pageTitle = pageTitles[path];
    
    // Handle dynamic routes (e.g., /products/123)
    if (!pageTitle && path.startsWith('/products/')) {
      pageTitle = 'Detalle del Producto';
    }
    
    if (path.startsWith('/admin')) {
      document.title = pageTitle 
        ? `${pageTitle} - Backoffice | Pegasus` 
        : 'Backoffice | Pegasus';
    } else {
      document.title = pageTitle 
        ? `${pageTitle} | Pegasus E-commerce` 
        : 'Pegasus E-commerce';
    }
  }, [location.pathname]);

  return null;
};
