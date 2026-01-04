import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { AppRoutes } from '@routes/AppRoutes';
import '@mantine/core/styles.css';

function App() {
  return (
    <MantineProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
