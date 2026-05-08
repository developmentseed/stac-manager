import React, { useCallback, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { StacApiProvider } from '@developmentseed/stac-react';
import { PluginConfigProvider } from '@stac-manager/data-core';

import { App } from './App';
import theme from './theme/theme';
import { config } from './plugin-system/config';
import { AuthProvider, useAuth } from './auth/Context';

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

  // Hold the latest token in a ref so the StacApi instance receives a
  // stable options getter — token rotation no longer rebuilds the client
  // or re-fires the landing-page probe.
  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const options = useCallback(() => {
    const t = tokenRef.current;
    return t ? { headers: { Authorization: `Bearer ${t}` } } : undefined;
  }, []);

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
