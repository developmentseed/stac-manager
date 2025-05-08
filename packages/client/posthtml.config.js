/* global process, module */
// https://github.com/parcel-bundler/parcel/issues/1209#issuecomment-942927265

module.exports = {
  plugins: {
    'posthtml-expressions': {
      locals: {
        appTitle: process.env.APP_TITLE,
        appDescription: process.env.APP_DESCRIPTION,
        baseurl: process.env.PUBLIC_URL || '/'
      }
    }
  }
};
