import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import {
  IconDashboard,
  IconShoppingCart,
  IconUsers,
  IconSettings,
  IconShield,
  IconPackage,
  IconFileText,
  IconShoppingBag,
  IconTruck,
  IconFileInvoice,
  IconRotate,
} from '@tabler/icons-react';
import { useSidebarStore } from '@stores/backoffice/sidebarStore';
import { useUserPermissions } from '@shared/hooks/useUserPermissions';
import type { MenuItem } from '@types';
import logoSvg from '@assets/logo/default.svg';

const { Sider } = Layout;

const menuItems: MenuItem[] = [
  {
    key: '/admin/dashboard',
    label: 'Dashboard',
    icon: <IconDashboard size={18} />,
    path: '/admin/dashboard',
  },
  {
    key: '/admin/catalog',
    label: 'Catálogo',
    icon: <IconShoppingCart size={18} />,
    children: [
      {
        key: '/admin/catalog/products',
        label: 'Productos',
        path: '/admin/catalog/products',
      },
      {
        key: '/admin/catalog/categories',
        label: 'Categorías',
        path: '/admin/catalog/categories',
      },
      {
        key: '/admin/catalog/brands',
        label: 'Marcas',
        path: '/admin/catalog/brands',
      },
    ],
  },
  {
    key: '/admin/orders',
    label: 'Pedidos',
    icon: <IconShoppingBag size={18} />,
    path: '/admin/orders',
  },
  {
    key: '/admin/inventory',
    label: 'Inventario',
    icon: <IconPackage size={18} />,
    children: [
      {
        key: '/admin/inventory/stock',
        label: 'Stock',
        path: '/admin/inventory/stock',
      },
      {
        key: '/admin/inventory/movements',
        label: 'Movimientos',
        path: '/admin/inventory/movements',
      },
      {
        key: '/admin/inventory/warehouses',
        label: 'Almacenes',
        path: '/admin/inventory/warehouses',
      },
    ],
  },
  {
    key: '/admin/purchases',
    label: 'Compras',
    icon: <IconFileInvoice size={18} />,
    children: [
      {
        key: '/admin/purchases/suppliers',
        label: 'Proveedores',
        path: '/admin/purchases/suppliers',
      },
      {
        key: '/admin/purchases/orders',
        label: 'Órdenes de Compra',
        path: '/admin/purchases/orders',
      },
    ],
  },
  {
    key: '/admin/logistics',
    label: 'Logística',
    icon: <IconTruck size={18} />,
    children: [
      {
        key: '/admin/logistics/shipments',
        label: 'Envíos',
        path: '/admin/logistics/shipments',
      },
      {
        key: '/admin/logistics/carriers',
        label: 'Transportistas',
        path: '/admin/logistics/carriers',
      },
    ],
  },
  {
    key: '/admin/invoices',
    label: 'Facturación',
    icon: <IconFileText size={18} />,
    path: '/admin/invoices',
  },
  {
    key: '/admin/rma',
    label: 'Devoluciones',
    icon: <IconRotate size={18} />,
    path: '/admin/rma',
  },
  {
    key: '/admin/customers',
    label: 'Clientes',
    icon: <IconUsers size={18} />,
    path: '/admin/customers',
  },
  {
    key: '/admin/security',
    label: 'Seguridad',
    icon: <IconShield size={18} />,
    children: [
      {
        key: '/admin/security/users',
        label: 'Usuarios',
        path: '/admin/security/users',
      },
      {
        key: '/admin/security/roles',
        label: 'Roles y Permisos',
        path: '/admin/security/roles',
      },
    ],
  },
  {
    key: '/admin/reports',
    label: 'Reportes',
    icon: <IconFileText size={18} />,
    path: '/admin/reports',
  },
  {
    key: '/admin/settings',
    label: 'Configuración',
    icon: <IconSettings size={18} />,
    path: '/admin/settings',
  },
];

export const BackofficeSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, toggleCollapsed } = useSidebarStore();
  const { data: allowedPaths, isLoading } = useUserPermissions();

  // Filter menu items based on user permissions
  const filteredMenuItems = useMemo(() => {
    // Si aún está cargando o el usuario es admin (null), mostrar todo
    if (isLoading || allowedPaths === null) {
      return menuItems;
    }

    // Si allowedPaths es un array vacío, el usuario no tiene permisos
    if (!allowedPaths || allowedPaths.length === 0) {
      return [];
    }

    // Filtrar items basándose en los permisos
    const filterItems = (items: MenuItem[]): MenuItem[] => {
      return items
        .map((item) => {
          // Si tiene children, filtrar recursivamente
          if (item.children) {
            const filteredChildren = filterItems(item.children);
            // Solo incluir el padre si tiene hijos visibles
            if (filteredChildren.length > 0) {
              return { ...item, children: filteredChildren };
            }
            return null;
          }

          // Si no tiene children, verificar si la ruta está permitida
          if (item.path && allowedPaths.includes(item.path)) {
            return item;
          }

          return null;
        })
        .filter((item): item is MenuItem => item !== null);
    };

    return filterItems(menuItems);
  }, [allowedPaths, isLoading]);

  // Find selected key based on current path
  // Buscar primero en los hijos (submódulos), luego en los padres
  const findSelectedKey = (): string => {
    // Primero buscar coincidencia exacta en todos los niveles
    for (const item of filteredMenuItems) {
      if (item.children) {
        const child = item.children.find((c) => c.path === location.pathname);
        if (child) return child.key;
      }
      if (item.path === location.pathname) return item.key;
    }
    
    // Si no hay coincidencia exacta, buscar por startsWith (para rutas dinámicas)
    for (const item of filteredMenuItems) {
      if (item.children) {
        const child = item.children.find((c) => location.pathname.startsWith(c.key));
        if (child) return child.key;
      }
      if (location.pathname.startsWith(item.key)) return item.key;
    }
    
    return location.pathname;
  };
  
  const selectedKey = findSelectedKey();

  // Find open keys (parent menu items)
  const defaultOpenKeys = filteredMenuItems
    .filter((item) => item.children && location.pathname.startsWith(item.key))
    .map((item) => item.key);

  const handleMenuClick = (key: string) => {
    const findPath = (items: MenuItem[], key: string): string | undefined => {
      for (const item of items) {
        if (item.key === key && item.path) return item.path;
        if (item.children) {
          const found = findPath(item.children, key);
          if (found) return found;
        }
      }
    };

    const path = findPath(filteredMenuItems, key);
    if (path) navigate(path);
  };

  // Show loading state
  if (isLoading) {
    return (
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={toggleCollapsed}
        width={240}
        theme="light"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          left: 0,
          top: 0,
          bottom: 0,
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            gap: collapsed ? 0 : 8,
            fontSize: collapsed ? 14 : 16,
            fontWeight: 600,
            borderBottom: '1px solid #f0f0f0',
            color: '#1f1f1f',
          }}
        >
          {collapsed ? (
            <img src={logoSvg} alt="Pegasus" style={{ width: 28, height: 28 }} />
          ) : (
            <>
              <span>PEGASUS</span>
              <img src={logoSvg} alt="Pegasus" style={{ width: 24, height: 24 }} />
              <span style={{ color: '#2f54eb' }}>ADMIN</span>
            </>
          )}
        </div>
      </Sider>
    );
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={toggleCollapsed}
      width={240}
      theme="light"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        left: 0,
        top: 0,
        bottom: 0,
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
          gap: collapsed ? 0 : 8,
          fontSize: collapsed ? 14 : 16,
          fontWeight: 600,
          borderBottom: '1px solid #f0f0f0',
          color: '#1f1f1f',
        }}
      >
        {collapsed ? (
          <img src={logoSvg} alt="Pegasus" style={{ width: 28, height: 28 }} />
        ) : (
          <>
            <span>PEGASUS</span>
            <img src={logoSvg} alt="Pegasus" style={{ width: 24, height: 24 }} />
            <span style={{ color: '#2f54eb' }}>ADMIN</span>
          </>
        )}
      </div>
      <Menu
        className="custom-sidebar-menu"
        theme="light"
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={defaultOpenKeys}
        items={filteredMenuItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          children: item.children?.map((child: MenuItem) => ({
            key: child.key,
            label: child.label,
          })),
        }))}
        onClick={({ key }) => handleMenuClick(key)}
      />
    </Sider>
  );
};
