import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { StacApiProvider } from '@developmentseed/stac-react';
import { PluginConfigProvider } from '@stac-manager/data-core';

import { App } from './App';
import theme from './theme/theme';
import { config } from './plugin-system/config';
import { KeycloakProvider } from './auth/Context';

const publicUrl = process.env.PUBLIC_URL || '';

let basename: string | undefined;
if (publicUrl) {
  try {
    basename = new URL(publicUrl).pathname;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // no-op
  }
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
          <KeycloakProvider>
            <StacApiProvider apiUrl={process.env.REACT_APP_STAC_API!}>
              <PluginConfigProvider config={config}>
                <App />
              </PluginConfigProvider>
            </StacApiProvider>
          </KeycloakProvider>
        </Router>
      </ChakraProvider>
    </React.StrictMode>
  );
}

const rootNode = document.querySelector('#app-container')!;
const root = createRoot(rootNode);
root.render(<Root />);
