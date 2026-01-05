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
  '/admin/invoicing': 'Facturación',
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
    const pageTitle = pageTitles[path];
    
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
