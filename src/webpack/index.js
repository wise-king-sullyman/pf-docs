const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const clientConfig = require('./config.client');

/**
 * Start webpack from configuration.
 *
 * @param {object} params
 * @param {*} params.css
 * @param {*} params.config
 * @param {number} params.port
 * @returns {boolean}
 */
const startWebpack = async ({ css, config, port } = {}) => {
  const webpackConfig = await clientConfig(null, { mode: 'development', port, ...config });

  const updatedWebpackConfig = {
    ...webpackConfig,
    devServer: {
      ...webpackConfig.devServer,
      filename: webpackConfig.output.filename,
      publicPath: webpackConfig.output.publicPath
    }
  };

  const { port: updatedPort } = updatedWebpackConfig.devServer;
  const server = new WebpackDevServer(
    webpack(updatedWebpackConfig),
    updatedWebpackConfig.devServer
  );

  server.listen(updatedPort, 'localhost', err => {
    if (err) {
      console.error(err);
    }
  });

  return true;
};

module.exports = {
  startWebpack
};
