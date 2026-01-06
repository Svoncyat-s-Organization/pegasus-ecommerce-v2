import { useEffect } from 'react';
import { AppShell, MantineProvider, createTheme, LoadingOverlay, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet } from 'react-router-dom';
import { StorefrontHeader } from './components/StorefrontHeader';
import { StorefrontFooter } from './components/StorefrontFooter';
import { usePublicStorefrontSettings, usePublicBusinessInfo } from '@features/storefront/settings';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';

export const StorefrontLayout = () => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  
  const { data: settings, isLoading: settingsLoading } = usePublicStorefrontSettings();
  const { data: businessInfo, isLoading: businessLoading } = usePublicBusinessInfo();
  const { setSettings, setBusinessInfo, setLoading, getPrimaryColor, getSecondaryColor } = useStorefrontConfigStore();

  // Update store when data loads
  useEffect(() => {
    if (settings) {
      setSettings(settings);
    }
    if (businessInfo) {
      setBusinessInfo(businessInfo);
    }
    setLoading(settingsLoading || businessLoading);
  }, [settings, businessInfo, settingsLoading, businessLoading, setSettings, setBusinessInfo, setLoading]);

  const primaryColor = getPrimaryColor();
  const secondaryColor = getSecondaryColor();

  // Create dynamic theme based on settings
  const theme = createTheme({
    primaryColor: 'brand',
    colors: {
      brand: [
        secondaryColor,
        adjustColor(primaryColor, 0.8),
        adjustColor(primaryColor, 0.6),
        adjustColor(primaryColor, 0.4),
        adjustColor(primaryColor, 0.2),
        primaryColor,
        adjustColor(primaryColor, -0.1),
        adjustColor(primaryColor, -0.2),
        adjustColor(primaryColor, -0.3),
        adjustColor(primaryColor, -0.4),
      ],
    },
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    headings: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      fontWeight: '600',
    },
    radius: {
      xs: '4px',
      sm: '6px',
      md: '8px',
      lg: '12px',
      xl: '16px',
    },
    defaultRadius: 'md',
  });

  const isLoading = settingsLoading || businessLoading;

  return (
    <MantineProvider theme={theme}>
      <Box pos="relative" style={{ minHeight: '100vh' }}>
        <LoadingOverlay 
          visible={isLoading} 
          zIndex={1000} 
          overlayProps={{ blur: 2 }} 
          loaderProps={{ color: primaryColor }}
        />
        <AppShell
          header={{ height: 70 }}
          padding={0}
          styles={{
            main: {
              backgroundColor: '#fafafa',
              minHeight: 'calc(100vh - 70px)',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <AppShell.Header
            style={{
              borderBottom: 'none',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <StorefrontHeader
              mobileOpened={mobileOpened}
              toggleMobile={toggleMobile}
            />
          </AppShell.Header>

          <AppShell.Main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box style={{ flex: 1 }}>
              <Outlet />
            </Box>
            <StorefrontFooter />
          </AppShell.Main>
        </AppShell>
      </Box>
    </MantineProvider>
  );
};

// Helper function to adjust color brightness
function adjustColor(hex: string, factor: number): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  if (factor > 0) {
    // Lighten
    r = Math.round(r + (255 - r) * factor);
    g = Math.round(g + (255 - g) * factor);
    b = Math.round(b + (255 - b) * factor);
  } else {
    // Darken
    r = Math.round(r * (1 + factor));
    g = Math.round(g * (1 + factor));
    b = Math.round(b * (1 + factor));
  }

  // Clamp values
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
