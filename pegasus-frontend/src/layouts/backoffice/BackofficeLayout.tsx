import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { BackofficeSidebar } from './components/BackofficeSidebar';
import { BackofficeHeader } from './components/BackofficeHeader';

const { Content } = Layout;

export const BackofficeLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <BackofficeSidebar />
      <Layout>
        <BackofficeHeader />
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
