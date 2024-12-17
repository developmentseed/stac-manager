/* global process */
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import log from 'fancy-log';
import { Parcel } from '@parcel/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// /////////////////////////////////////////////////////////////////////////////
// --------------------------- Variables -------------------------------------//
// ---------------------------------------------------------------------------//

// Environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const readPackage = () =>
  JSON.parse(fs.readFileSync(`${__dirname}/../package.json`));

// Set the version in an env variable.
process.env.APP_VERSION = readPackage().version;
process.env.APP_BUILD_TIME = Date.now();

// Simple task to copy the static files to the dist directory. The static
// directory will be watched so that files are copied when anything changes.
async function copyFiles() {
  const source = `${__dirname}/../static/`;
  const dist = `${__dirname}/../dist`;

  await fs.remove(dist);
  await fs.ensureDir(dist);
  await fs.copy(source, dist);
  log.info('📦 Copied static files to dist.');
}

async function parcelServe() {
  const bundler = new Parcel({
    entries: `${__dirname}/../src/index.html`,
    defaultConfig: `${__dirname}/../.parcelrc`,
    cacheDir: `${__dirname}/../.parcel-cache`,
    mode: 'production',
    defaultTargetOptions: {
      distDir: `${__dirname}/../dist`,
      publicUrl: process.env.PUBLIC_URL || '/'
    },
    additionalReporters: [
      {
        packageName: '@parcel/reporter-cli',
        resolveFrom: __filename
      }
    ]
  });

  try {
    let { bundleGraph, buildTime } = await bundler.run();
    let bundles = bundleGraph.getBundles();
    log.info(`✨ Built ${bundles.length} bundles in ${buildTime}ms!`);
  } catch (err) {
    log.warn(err.diagnostics);
  }
}

copyFiles();
parcelServe();
