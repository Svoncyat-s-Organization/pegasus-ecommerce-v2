import { Layout, Avatar, Dropdown, Space, Typography } from 'antd';
import { IconUser, IconLogout, IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@stores/backoffice/authStore';
import type { MenuProps } from 'antd';

const { Header } = Layout;
const { Text } = Typography;

export const BackofficeHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Mi Perfil',
      icon: <IconUser size={16} />,
      onClick: () => navigate('/admin/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Cerrar Sesión',
      icon: <IconLogout size={16} />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <Space direction="vertical" size={0} style={{ lineHeight: 'normal' }}>
        <Text strong style={{ fontSize: 16, display: 'block' }}>
          Panel administrativo
        </Text>
        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
          Pegasus E-commerce
        </Text>
      </Space>
      
      <Dropdown menu={{ items }} trigger={['click']}>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              style={{ backgroundColor: '#2f54eb', color: '#ffffff' }}
            >
              {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
            </Avatar>
            <Text strong>{user?.username || 'Admin'}</Text>
            <IconChevronDown size={14} />
          </Space>
        </Dropdown>
    </Header>
  );
};
