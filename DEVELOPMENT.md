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

### Developing with a Local `stac-react`

To develop against a local checkout of `@developmentseed/stac-react`, set the `STAC_REACT_LOCAL` environment variable to point to its source entry:

```
STAC_REACT_LOCAL=/path/to/stac-react/src/index.ts npm run client:serve
```

This aliases `@developmentseed/stac-react` to the local source, giving you HMR on changes to both repos simultaneously. When the variable is unset, the published npm package is used as normal.

The same variable works for library package builds:

```
STAC_REACT_LOCAL=/path/to/stac-react/src/index.ts npm run plugins:build
```

### Building for Production
Build the app for production:
```
npm run all:build
```
This bundles the app in production mode, optimizing the build for performance. The build is minified, and filenames include hashes.

## Contributing
Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.
