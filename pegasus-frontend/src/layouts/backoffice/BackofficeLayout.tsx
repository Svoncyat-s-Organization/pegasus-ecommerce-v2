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
            margin: '24px',
            padding: 24,
            minHeight: 'calc(100vh - 112px)',
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
