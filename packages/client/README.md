# @stac-manager/client

## Introduction
The STAC-Manager is a tool designed for managing the values of a STAC (SpatioTemporal Asset Catalog) collection and its items. This interface provides a user-friendly way to modify and update the properties of collections and items within a STAC catalog.

## Installation and Usage
See root README.md for instructions on how to install and run the project.

## Client specific instructions

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

# Auth
REACT_APP_KEYCLOAK_URL
REACT_APP_KEYCLOAK_CLIENT_ID
REACT_APP_KEYCLOAK_REALM

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
The client uses Keycloack for authentication, which is disabled by default. To
enable it you must provide values for the `REACT_APP_KEYCLOAK_*` environment variables. These can be obtained through the Keycloak server.

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
