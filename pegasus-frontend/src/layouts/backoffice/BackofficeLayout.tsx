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
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
