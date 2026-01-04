import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet } from 'react-router-dom';
import { StorefrontHeader } from './components/StorefrontHeader';
import { StorefrontFooter } from './components/StorefrontFooter';

export const StorefrontLayout = () => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 70 }}
      footer={{ height: 60 }}
      padding="md"
      styles={(theme) => ({
        main: {
          backgroundColor: theme.colors.gray[0],
          minHeight: 'calc(100vh - 130px)',
        },
      })}
    >
      <AppShell.Header>
        <StorefrontHeader
          mobileOpened={mobileOpened}
          toggleMobile={toggleMobile}
        />
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer>
        <StorefrontFooter />
      </AppShell.Footer>
    </AppShell>
  );
};
