import React, { useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { StacApiProvider } from '@developmentseed/stac-react';
import { PluginConfigProvider } from '@stac-manager/data-core';

import { App } from './App';
import theme from './theme/theme';
import { config } from './plugin-system/config';
import { AuthProvider, useAuth } from './auth/Context';
import { setApiAuthToken } from './api';

const publicUrl = process.env.PUBLIC_URL || '';
const stacApiUrl = process.env.REACT_APP_STAC_API!;

let basename: string | undefined;
if (publicUrl) {
  try {
    basename = new URL(publicUrl).pathname;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // no-op
  }
}

function StacApiAuthBridge({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();

  useEffect(() => {
    setApiAuthToken(token);
    return () => setApiAuthToken(undefined);
  }, [token]);

  const options = useMemo(
    () =>
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
    [token]
  );

  return (
    <StacApiProvider apiUrl={stacApiUrl} options={options}>
      {children}
    </StacApiProvider>
  );
}

// Root component.
function Root() {
  useEffect(() => {
    // Hide the welcome banner.
    const banner = document.querySelector('#welcome-banner');
    if (!banner) return;
    banner.classList.add('dismissed');
    setTimeout(() => banner.remove(), 500);
  }, []);

  return (
    <React.StrictMode>
      <ColorModeScript />
      <ChakraProvider theme={theme}>
        <Router basename={basename}>
          <AuthProvider>
            <StacApiAuthBridge>
              <PluginConfigProvider config={config}>
                <App />
              </PluginConfigProvider>
            </StacApiAuthBridge>
          </AuthProvider>
        </Router>
      </ChakraProvider>
    </React.StrictMode>
  );
}

const rootNode = document.querySelector('#app-container')!;
const root = createRoot(rootNode);
root.render(<Root />);
