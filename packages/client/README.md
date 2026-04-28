# @stac-manager/client

## Introduction
The STAC-Manager is a tool designed for managing the values of a STAC (SpatioTemporal Asset Catalog) collection and its items. This interface provides a user-friendly way to modify and update the properties of collections and items within a STAC catalog.

## Installation and Usage
See root README.md for instructions on how to install and run the project.

## Client specific instructions

### Environment Configuration

The application uses environment variables for configuration. A template file `.env.example` is provided as a template.

To configure the application:
1. Copy `.env.example` to `.env`
2. Modify the `.env` file with your specific configuration values
3. Never modify `.env.example` directly as it serves as documentation

Some client options are controlled by environment variables. These are:
```
# App config
## Title and description of the app for metadata
APP_TITLE
APP_DESCRIPTION
## If the app is being served in from a subfolder, the domain url must be set.
PUBLIC_URL

# API
REACT_APP_STAC_BROWSER
REACT_APP_STAC_API

# Auth (OIDC)
REACT_APP_OIDC_AUTHORITY
REACT_APP_OIDC_CLIENT_ID

# Theming
REACT_APP_THEME_PRIMARY_COLOR
REACT_APP_THEME_SECONDARY_COLOR
```

**Public URL**  
It is recommended to always set the `PUBLIC_URL` environment variable on a production build.
If the app is being served from a subfolder, the `PUBLIC_URL` should include the subfolder path. **Do not include a trailing slash.**

For example, if the app is being served from `https://example.com/stac-manager`, the `PUBLIC_URL` should be set to `https://example.com/stac-manager`.

> [!IMPORTANT]
> The `PUBLIC_URL` environment variable must be set before running the build script, and therefore the `.env` file cannot be used to set this variable.

You must provide a value for the `REACT_APP_STAC_API` environment variable. This should be the URL of the STAC API you wish to interact with.

If the `REACT_APP_STAC_BROWSER` environment variable is not set, [Radiant Earth's STAC Browser](https://radiantearth.github.io/stac-browser/) will be used by default, which will connect to the STAC API specified in `REACT_APP_STAC_API`.

**Auth**

The client supports any OIDC-compliant identity provider (Keycloak, Auth0,
Cognito, Okta, Entra, Google, …). Authentication is disabled by default. To
enable it, set:

- `REACT_APP_OIDC_AUTHORITY` — the issuer/authority URL. For Keycloak this is
  `<keycloak-url>/realms/<realm>` (e.g. `https://iam.example.com/realms/my-realm`).
- `REACT_APP_OIDC_CLIENT_ID` — the client ID registered with your provider.

Your OIDC client must allow the app's origin as a valid redirect URI. For
Keycloak specifically, ensure **Web Origins** on the client includes the app
origin (or `+` to inherit from Valid Redirect URIs) so the silent-renew flow
works.

### Theming

The Stac manager client allows for simple theming to give the instance a different look and feel.  
The primary and secondary colors can be set using the `REACT_APP_THEME_PRIMARY_COLOR` and `REACT_APP_THEME_SECONDARY_COLOR` environment variables. These should be set to a valid CSS color value.

The app has a default logo shown below, but it can be customized by replacing the necessary files.

<img src='./static/meta/icon-512.png' alt='STAC Manager Logo' width='100px' />

The logo should be a square image with a size of 512x512 pixels and should be placed in the `static/meta` folder with the name `icon-512.png`.

To ensure the branding is consistent, the remaining meta images (in the `static/meta` folder) should also be replaced:
```
icon-192.png            192x192
icon-512.png            512x512
favicon.png             32x32
apple-touch-icon.png    360x360
meta-image.png          1920x1080
```