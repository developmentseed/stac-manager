// https://www.dhiwise.com/post/a-comprehensive-guide-to-the-rollup-plugin-typescript2
import { readFileSync } from 'fs';
import path from 'path';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import { dts } from 'rollup-plugin-dts';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-import-css';

const dirname = process.cwd();
const pkg = JSON.parse(readFileSync(path.join(dirname, './package.json')));

const env = process.env.NODE_ENV || 'development';

const outputOptions = {
  exports: 'named',
  banner: `/*
 * Stac-manager
 * {@link https://github.com/developmentseed}
 * @copyright Development Seed
 * @license MIT
 */`,
  sourcemap: true,
  inlineDynamicImports: true
};

export default [
  // ESM and CJS
  {
    input: path.join(dirname, './lib/index.ts'),
    plugins: [
      peerDepsExternal(),
      nodeResolve(),
      commonjs(),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(env),
        'process.env.PACKAGE_VERSION': pkg.version
      }),
      typescript({ useTsconfigDeclarationDir: true, clean: true }),
      css()
    ],
    output: [
      { file: pkg.main, format: 'cjs', ...outputOptions },
      { file: pkg.module, format: 'es', ...outputOptions }
    ]
  },
  {
    input: path.join(dirname, './lib/index.ts'),
    output: [{ file: path.join(dirname, 'dist/index.d.ts'), format: 'es' }],
    plugins: [dts()]
  }
];
