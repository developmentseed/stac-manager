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

const composingComponents = [
  [ChakraProvider, { theme }],
  [Router, { basename }],
  [KeycloakProvider, {}],
  [StacApiProvider, { apiUrl: process.env.REACT_APP_STAC_API! }],
  [PluginConfigProvider, { config }]
] as const;

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
      <Composer components={composingComponents}>
        <App />
      </Composer>
    </React.StrictMode>
  );
}

const rootNode = document.querySelector('#app-container')!;
const root = createRoot(rootNode);
root.render(<Root />);

/**
 * Composes components to to avoid deep nesting trees. Useful for contexts.
 *
 * @param {node} children Component children
 * @param {array} components The components to compose.
 */
function Composer(props: {
  children: React.ReactNode;
  components: readonly (readonly [React.ComponentType<any>, any])[];
}) {
  const { children, components } = props;
  const itemToCompose = [...components].reverse();

  return itemToCompose.reduce(
    (acc, [Component, props = {}]) => <Component {...props}>{acc}</Component>,
    children
  );
}

Object.defineProperty(Array.prototype, 'last', {
  enumerable: false,
  configurable: true,
  get: function () {
    return this[this.length - 1];
  },
  set: undefined
});

// 😱😱😱😱😱😱😱
//
// stac-manager relies on stac-react for making STAC API requests.
// Currently, stac-react adds a 'Content-Type: application/json' header to all
// requests, including GET requests. However, the api server rejects GET
// requests with this header. Ideally, the server should accept this header, but
// as a workaround, we remove it from GET requests to avoid server errors. This
// is a temporary fix is just to get things working while stac-react is updated.
// I promise it is temporary!
const fetch = window.fetch;
window.fetch = (async (input: RequestInfo, init?: RequestInit) => {
  // If is a GET request, without body, remove the Content-Type header.
  if (
    init &&
    (!init.method || init.method.toUpperCase() === 'GET') &&
    !init.body &&
    // @ts-expect-error Content-Type can be a header property
    init.headers?.['Content-Type']
  ) {
    // @ts-expect-error Content-Type can be a header property
    delete init.headers['Content-Type'];
  }
  return fetch(input, init);
}) as typeof window.fetch;
