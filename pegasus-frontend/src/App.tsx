import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { ConfigProvider, theme } from 'antd';
import { AppRoutes } from '@routes/AppRoutes';
import { PageTitle } from '@shared/components/PageTitle';
import { useThemeStore } from '@stores/backoffice/themeStore';
import esES from 'antd/locale/es_ES';
import '@mantine/core/styles.css';

function App() {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <ConfigProvider
      locale={esES}
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
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
