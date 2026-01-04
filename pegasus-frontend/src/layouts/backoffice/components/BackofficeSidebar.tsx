import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IconDashboard,
  IconShoppingCart,
  IconUsers,
  IconSettings,
  IconShield,
  IconPackage,
  IconFileText,
} from '@tabler/icons-react';
import { useSidebarStore } from '@stores/backoffice/sidebarStore';
import type { MenuItem } from '@types';

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
        label: 'Roles',
        path: '/admin/security/roles',
      },
      {
        key: '/admin/security/permissions',
        label: 'Permisos',
        path: '/admin/security/permissions',
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

  // Find selected key based on current path
  const selectedKey = menuItems.find((item) =>
    location.pathname.startsWith(item.key)
  )?.key || location.pathname;

  // Find open keys (parent menu items)
  const defaultOpenKeys = menuItems
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

    const path = findPath(menuItems, key);
    if (path) navigate(path);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={toggleCollapsed}
      width={240}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 20 : 24,
          fontWeight: 600,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {collapsed ? '🦄' : '🦄 Pegasus'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={defaultOpenKeys}
        items={menuItems.map((item) => ({
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
