/* global process */
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import log from 'fancy-log';

// Adapted into a script from: https://github.com/rafgraph/spa-github-pages/tree/gh-pages

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = process.env.PUBLIC_URL || '';

const pathIndex = path.join(__dirname, '../src/index.html');
const path404 = path.join(__dirname, '../static/404.html');

async function main() {
  log.info('📦 Setting up single page apps on GitHub Pages.');

  const has404 = await fs.pathExists(path404);

  if (has404) {
    log.warn('📦 Found custom 404.html. Skipping setup.');
    process.exit(0);
  }

  if (!baseUrl) {
    log.warn(
      '📦 Public URL not set. Assuming the app is deployed to the root.'
    );
  }

  let segments = 0;
  if (baseUrl) {
    try {
      segments = new URL(baseUrl).pathname.split('/').length - 1;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // no-op
    }
    log.info(`📦 Using ${baseUrl} with ${segments} path segments.`);
  }

  const templateScript = `<!-- Start Single Page Apps for GitHub Pages -->
    <script type="text/javascript">
      // Single Page Apps for GitHub Pages
      // MIT License
      // https://github.com/rafgraph/spa-github-pages
      // This script checks to see if a redirect is present in the query string,
      // converts it back into the correct url and adds it to the
      // browser's history using window.history.replaceState(...),
      // which won't cause the browser to attempt to load the new url.
      // When the single page app is loaded further down in this file,
      // the correct url will be waiting in the browser's history for
      // the single page app to route accordingly.
      (function(l) {
        if (l.search[1] === '/' ) {
          var decoded = l.search.slice(1).split('&').map(function(s) { 
            return s.replace(/~and~/g, '&')
          }).join('?');
          window.history.replaceState(null, null,
              l.pathname.slice(0, -1) + decoded + l.hash
          );
        }
      }(window.location))
    </script>
    <!-- End Single Page Apps for GitHub Pages -->`;

  // Write to index head.
  const index = await fs.readFile(pathIndex, 'utf8');
  const newIndex = index.replace('<head>', `<head>\n${templateScript}`);
  await fs.writeFile(pathIndex, newIndex);

  const template404 = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Single Page Apps for GitHub Pages</title>
    <script type="text/javascript">
      // Single Page Apps for GitHub Pages
      // MIT License
      // https://github.com/rafgraph/spa-github-pages
      // This script takes the current url and converts the path and query
      // string into just a query string, and then redirects the browser
      // to the new url with only a query string and hash fragment,
      // e.g. https://www.foo.tld/one/two?a=b&c=d#qwe, becomes
      // https://www.foo.tld/?/one/two&a=b~and~c=d#qwe
      // Note: this 404.html file must be at least 512 bytes for it to work
      // with Internet Explorer (it is currently > 512 bytes)

      // If you're creating a Project Pages site and NOT using a custom domain,
      // then set pathSegmentsToKeep to 1 (enterprise users may need to set it to > 1).
      // This way the code will only replace the route part of the path, and not
      // the real directory in which the app resides, for example:
      // https://username.github.io/repo-name/one/two?a=b&c=d#qwe becomes
      // https://username.github.io/repo-name/?/one/two&a=b~and~c=d#qwe
      // Otherwise, leave pathSegmentsToKeep as 0.
      var pathSegmentsToKeep = ${segments};

      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );

    </script>
  </head>
  <body>
  </body>
</html>`;

  // Write to 404.html.
  await fs.writeFile(path404, template404);

  log.info('✅ GitHub Pages setup complete.');
}

main();
