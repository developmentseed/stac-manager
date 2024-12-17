# STAC-Manager :satellite: :page_facing_up: 

## Introduction
The STAC-Manager is a tool designed for managing the values of a STAC (SpatioTemporal Asset Catalog) collection and its items. This interface provides a user-friendly way to modify and update the properties of collections and items within a STAC catalog.

## Repository structure

This repository is a monorepo for the STAC-Manager project managed using [lerna](https://lerna.js.org/).  
It contains the stac-manager web app along with the form build plugin system that powers it.

All the packages are located in the `packages` directory structured as follows:

- `@stac-manager/client` - STAC-Manager web app.
- `@stac-manager/data-core` - Core functionality of the form builder plugin system.
- `@stac-manager/data-widgets` - Form components to be used by the form builder plugin system, when custom ones are not provided.
- `@stac-manager/data-plugins` - Data plugins for the forms. Each plugin defines how a section of the data structure is displayed and edited.

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

## Contributing
Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License
This project is licensed under the MIT license - see the LICENSE.md file for details.
