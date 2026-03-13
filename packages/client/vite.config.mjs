import { readFileSync } from 'fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const pkg = JSON.parse(readFileSync(path.join(__dirname, './package.json'), 'utf-8'));

// Load all env vars from .env files (not just VITE_-prefixed ones)
const env = loadEnv('', __dirname, ['REACT_APP_', 'APP_', 'PUBLIC_']);
// Merge loaded .env vars into process.env so the define block picks them up
Object.assign(process.env, env);

const stacReactLocal = process.env.STAC_REACT_LOCAL;

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  publicDir: 'static',
  base: process.env.PUBLIC_URL || '/',
  resolve: {
    alias: {
      $components: path.resolve(__dirname, './src/components'),
      $styles: path.resolve(__dirname, './src/styles'),
      $utils: path.resolve(__dirname, './src/utils'),
      $hooks: path.resolve(__dirname, './src/hooks'),
      $pages: path.resolve(__dirname, './src/pages'),
      $test: path.resolve(__dirname, './test'),
      ...(stacReactLocal && {
        '@developmentseed/stac-react': path.resolve(stacReactLocal),
      }),
    },
  },
  define: {
    'process.env.REACT_APP_STAC_API': JSON.stringify(process.env.REACT_APP_STAC_API),
    'process.env.REACT_APP_KEYCLOAK_URL': JSON.stringify(process.env.REACT_APP_KEYCLOAK_URL),
    'process.env.REACT_APP_KEYCLOAK_REALM': JSON.stringify(process.env.REACT_APP_KEYCLOAK_REALM),
    'process.env.REACT_APP_KEYCLOAK_CLIENT_ID': JSON.stringify(process.env.REACT_APP_KEYCLOAK_CLIENT_ID),
    'process.env.REACT_APP_STAC_BROWSER': JSON.stringify(process.env.REACT_APP_STAC_BROWSER),
    'process.env.REACT_APP_THEME_PRIMARY_COLOR': JSON.stringify(process.env.REACT_APP_THEME_PRIMARY_COLOR),
    'process.env.REACT_APP_THEME_SECONDARY_COLOR': JSON.stringify(process.env.REACT_APP_THEME_SECONDARY_COLOR),
    'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL || ''),
    'process.env.APP_VERSION': JSON.stringify(pkg.version),
    'process.env.APP_TITLE': JSON.stringify(process.env.APP_TITLE || ''),
    'process.env.APP_BUILD_TIME': JSON.stringify(Date.now()),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  server: {
    port: 9000,
  },
  build: {
    outDir: 'dist',
  },
});
