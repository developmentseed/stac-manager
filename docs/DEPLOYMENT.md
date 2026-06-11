# Deployment (Cloudflare Pages)

The client is a static single-page app, deployed to Cloudflare Pages via the
[Cloudflare GitHub App](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
(git integration). Cloudflare builds and deploys on every push — there is no
deploy workflow in this repository.

## Environments

| Trigger | URL |
|---|---|
| Any PR / non-production branch | `<branch>.stac-manager.pages.dev` (preview) |
| Push to `main` | `main.stac-manager.pages.dev` (staging) |
| Push to `release` | `stac-manager.pages.dev` (production) |

The Pages project's **production branch is `release`**. To promote what is on
`main` to production, fast-forward the `release` branch:

```sh
git fetch origin
git push origin origin/main:release
```

Every other branch (including PR branches) gets an isolated preview
deployment, and the GitHub App posts the preview URL on the PR.

## Project configuration

One-time setup, in the Cloudflare dashboard (Workers & Pages → Create →
Pages → Connect to Git):

- **Production branch**: `release`
- **Build command**: `npm run all:build && cp packages/client/_redirects packages/client/dist/`
- **Build output directory**: `packages/client/dist`
- **Root directory**: `/` (the monorepo root — plugins must build before the client)

Environment variables (set for both production and preview):

| Variable | Notes |
|---|---|
| `REACT_APP_STAC_API` | Required. STAC API endpoint. |
| `APP_TITLE` | Required by the posthtml template in `index.html` (e.g. `STAC Manager`). |
| `APP_DESCRIPTION` | Required by the posthtml template (e.g. `Plugin based STAC editor`). |
| `REACT_APP_STAC_BROWSER` | Optional. Defaults to Radiant Earth's STAC Browser. |
| `REACT_APP_OIDC_AUTHORITY` / `REACT_APP_OIDC_CLIENT_ID` | Optional. If set, note that preview URLs are per-branch, so the OIDC client needs a wildcard redirect URI (`https://*.stac-manager.pages.dev/*`) or auth stays disabled on previews. |
| `PUBLIC_URL` | Required by the build script (`tasks/build.mjs`). Set to `/` for every environment — each Cloudflare deployment (preview, staging, production) serves from the root of its own subdomain. |

The Node version is read from `.nvmrc` by Cloudflare's build image.

## SPA routing

`packages/client/_redirects` (`/* /index.html 200`) is copied into the build
output by the build command so deep links resolve to the app instead of 404s.
