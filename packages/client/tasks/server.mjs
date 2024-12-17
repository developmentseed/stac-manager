/* global process */
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import Watcher from 'watcher';
import portscanner from 'portscanner';
import log from 'fancy-log';
import { Parcel } from '@parcel/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __appRoot = path.join(__dirname, '..');

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

async function findPort() {
  return new Promise((resolve, reject) => {
    portscanner.findAPortNotInUse(9000, 9999, function (error, port) {
      return error ? reject(error) : resolve(port);
    });
  });
}

// Simple task to copy the static files to the dist directory. The static
// directory will be watched so that files are copied when anything changes.
async function copyFiles() {
  const source = `${__appRoot}/static/`;
  const dist = `${__appRoot}/dist`;

  await fs.ensureDir(dist);
  await fs.copy(source, dist);
  log.info('📦 Copied static files to dist.');

  const watcher = new Watcher(source, {
    renameDetection: true,
    ignoreInitial: true
  });

  watcher.on('all', (event, targetPath) => {
    log.info(`📦 ${event} ${targetPath}`);
    fs.copy(source, dist);
  });
}

// Parcel development server
async function parcelServe() {
  const port = await findPort();

  if (port !== 9000) {
    log.warn(`  Port 9000 is busy. Using port ${port} instead.`);
  }

  const bundler = new Parcel({
    entries: `${__appRoot}/src/index.html`,
    defaultConfig: `${__appRoot}/.parcelrc`,
    cacheDir: `${__appRoot}/.parcel-cache`,
    defaultTargetOptions: {
      distDir: `${__appRoot}/dist`
    },
    shouldAutoInstall: false,
    additionalReporters: [
      {
        packageName: '@parcel/reporter-cli',
        resolveFrom: __appRoot
      }
    ],
    serveOptions: {
      port
    },
    hmrOptions: {
      port
    }
  });

  await bundler.watch((err, event) => {
    if (err) {
      // fatal error
      throw err;
    }

    if (event.type === 'buildSuccess') {
      let bundles = event.bundleGraph.getBundles();
      log.info(`✨ Built ${bundles.length} bundles in ${event.buildTime}ms!`);
    } else if (event.type === 'buildFailure') {
      log.warn(event.diagnostics);
    }
  });
}

copyFiles();
parcelServe();
