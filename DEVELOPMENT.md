# STAC-Manager 📡 📄 — Development

## Installation and Usage
The steps below will walk you through setting up your own instance of the project.

### Install Project Dependencies
To set up the development environment for this website, you'll need to install the following on your system:

- [Node](http://nodejs.org/) v20 (To manage multiple node versions we recommend [nvm](https://github.com/creationix/nvm))

### Install Application Dependencies

If you use [`nvm`](https://github.com/creationix/nvm), activate the desired Node version:

```
nvm install
```

Install Node modules:

```
npm install
```

### Running the App

To run the client app in development mode:
```
npm run plugins:build
npm run client:serve
```

If you're going to work on the form builder plugin system as well, you may want to run the watch mode on the packages:
```
npm run plugins:watch
```

### Building for Production
Build the app for production:
```
npm run all:build
```
This bundles the app in production mode, optimizing the build for performance. The build is minified, and filenames include hashes.

## Releases & Deployment

### Releases

Releases are automated with [release-please](https://github.com/googleapis/release-please) ([`.github/workflows/release-please.yml`](.github/workflows/release-please.yml)), driven by [Conventional Commits](https://www.conventionalcommits.org/) on `main`:

1. Every push to `main` updates a rolling **release PR** that accumulates pending `feat:` (minor bump) and `fix:` (patch bump) commits, along with a generated `CHANGELOG.md` entry. The workflow authenticates as the **DS Release Bot** GitHub App (org-level `DS_RELEASE_BOT_CLIENT_ID` variable and `DS_RELEASE_BOT_PRIVATE_KEY` secret) so the tags it creates can trigger downstream workflows.
2. Merging the release PR bumps the version in the root and client `package.json` files (see [`release-please-config.json`](release-please-config.json)), tags the commit `vX.Y.Z`, and publishes a GitHub release.

Note: tags of the form `stac-manager-X.Y.Z` belong to the Helm chart, which is released separately by chart-releaser ([`.github/workflows/release-helm-chart.yml`](.github/workflows/release-helm-chart.yml)).

### Docker images

[`.github/workflows/docker-build-push.yml`](.github/workflows/docker-build-push.yml) publishes images to `ghcr.io/developmentseed/stac-manager`:

- **Pushes to `main`** build the `:main` and `:sha-*` tags (the development tip).
- **Release tags (`v*`)** build the `:X.Y.Z`, `:X.Y`, and `:latest` tags — so `latest` always points at the most recent release, not the latest commit.

### GitHub Pages (releases)

[`.github/workflows/deploy-gh.yml`](.github/workflows/deploy-gh.yml) deploys the client to the `gh-pages` branch on every release tag (`v*`), so the GitHub Pages site always reflects the **latest release**. It can also be run manually via `workflow_dispatch`.

### Cloudflare Pages (dev previews)

Cloudflare Pages deployments are configured through the Cloudflare dashboard (git integration), not through a workflow in this repository. Cloudflare builds the app itself on each push and serves **dev previews**: one per branch, with `main` acting as the development tip.

### App version stamping

The version shown in the app (`process.env.APP_VERSION`) is resolved at build time, in order of precedence:

1. An explicit `APP_VERSION` environment variable — set by the Docker build (branch name for branch builds, `X.Y.Z` for releases) and the GitHub Pages deploy (the release version).
2. `CF_PAGES_BRANCH` on Cloudflare Pages builds (the branch name, e.g. `main` for the dev preview).
3. The client `package.json` version — used by local builds; release-please keeps it current.

Docker images built without the `APP_VERSION` build-arg retain a `%APP_VERSION%` placeholder that [`docker-entrypoint.sh`](docker-entrypoint.sh) substitutes from the container environment at startup (defaulting to `dev`).

## Contributing
Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.
