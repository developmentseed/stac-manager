import { readFileSync } from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const dirname = process.cwd();
const pkg = JSON.parse(readFileSync(path.join(dirname, './package.json'), 'utf-8'));

const stacReactLocal = process.env.STAC_REACT_LOCAL;

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      tsconfigPath: path.join(dirname, './tsconfig.json'),
    }),
  ],
  resolve: {
    alias: {
      ...(stacReactLocal && {
        '@developmentseed/stac-react': path.resolve(stacReactLocal),
      }),
    },
  },
  build: {
    lib: {
      entry: path.join(dirname, './lib/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    rollupOptions: {
      external: [
        ...Object.keys(pkg.peerDependencies || {}),
        ...Object.keys(pkg.dependencies || {}),
        'react/jsx-runtime',
      ],
      output: {
        banner: `/*
 * Stac-manager
 * {@link https://github.com/developmentseed}
 * @copyright Development Seed
 * @license MIT
 */`,
      },
    },
    sourcemap: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
  },
});
