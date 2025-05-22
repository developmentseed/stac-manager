# STAC-Manager 📡 📄

## Introduction

STAC Manager allows you to list, create, read, update, and delete STAC collections and items in a web application.

It currently connects to a STAC API via the the [STAC API - Transation Extension](https://github.com/stac-api-extensions/transaction) and can be configured to support standard authentication and authorization flows, if needed.

The application is extendable with plugins to provide user-friendly interfaces for various STAC extensions or custom properties.

The primary intended use is for detail-oriented curation of STAC collections by subject matter experts, for example fine-tuning providers or keywords, adding [STAC Rendering Extension](https://github.com/stac-extensions/render) configurations, or starting a new collection. It does not target the generation and ingestion of large STAC item sets, which is better done programmatically.

We just released this software and are curious to hear about use cases and limitations - please share your experience via this GitHub repository.


## Repository structure

This repository is a monorepo for the STAC-Manager project managed using [lerna](https://lerna.js.org/).  
It contains the stac-manager web app along with the form build plugin system that powers it.

All the packages are located in the `packages` directory structured as follows:

- [`@stac-manager/client`](./packages/client) - STAC-Manager web app.
- [`@stac-manager/data-core`](./packages/data-core) - Core functionality of the form builder plugin system.
- [`@stac-manager/data-widgets`](./packages/data-widgets) - Form components to be used by the form builder plugin system, when custom ones are not provided.
- [`@stac-manager/data-plugins`](./packages/data-plugins) - Data plugins for the forms. Each plugin defines how a section of the data structure is displayed and edited.

## Development & Technical Documentation

To set up the project for development, follow the instructions in the [development documentation](./DEVELOPMENT.md) and get familiar with the app architecture and the plugin system by reading the [technical documentation](./docs/README.md).

## License
This project is licensed under the MIT license - see the LICENSE.md file for details.

## Docker
To run the STAC-Manager in a Docker container, you can use the provided Dockerfile.

**Build the Docker image**
```bash
docker build -t stac-manager .
```

**Run the Docker container**
```bash
docker run --rm -p 8080:80 --name stac-manager -e 'PUBLIC_URL=http://your-url.com' stac-manager
```

> [!NOTE]
> The application performs a complete build during container startup to ensure environment variables are properly integrated. This process may take a couple minutes to complete.
