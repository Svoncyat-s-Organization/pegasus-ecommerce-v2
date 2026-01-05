import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { ConfigProvider } from 'antd';
import { AppRoutes } from '@routes/AppRoutes';
import { PageTitle } from '@shared/components/PageTitle';
import esES from 'antd/locale/es_ES';
import '@mantine/core/styles.css';

function App() {
  return (
    <ConfigProvider
      locale={esES}
      theme={{
        token: {
          colorPrimary: '#2f54eb',
          borderRadius: 6,
          fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
        },
      }}
    >
      <MantineProvider>
        <BrowserRouter>
          <PageTitle />
          <AppRoutes />
        </BrowserRouter>
      </MantineProvider>
    </ConfigProvider>
  );
}

export default App;
