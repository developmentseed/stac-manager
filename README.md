# STAC-Manager 📡 📄

## Introduction
The STAC-Manager is a tool designed for managing the values of a STAC (SpatioTemporal Asset Catalog) collection and its items. This interface provides a user-friendly way to modify and update the properties of collections and items within a STAC catalog.

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