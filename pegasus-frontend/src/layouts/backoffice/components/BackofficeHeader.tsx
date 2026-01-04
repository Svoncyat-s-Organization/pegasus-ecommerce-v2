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
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <Dropdown menu={{ items }} trigger={['click']}>
        <Space style={{ cursor: 'pointer' }}>
          <Avatar
            style={{ backgroundColor: '#1677ff' }}
            icon={<IconUser size={16} />}
          />
          <Text strong>{user?.email || 'Admin'}</Text>
          <IconChevronDown size={14} />
        </Space>
      </Dropdown>
    </Header>
  );
};
