const WebpackDevServer = require('webpack-dev-server');
const Webpack = require('webpack');
const clientConfig = require('./config.client');

/**
 * Start webpack from configuration.
 *
 * @param {object} params
 * @param {*} params.css
 * @param {object} params.config
 * @param {number} params.port
 * @returns {boolean}
 */
const startWebpack = async ({ css, config, port } = {}) => {
  const webpackConfig = await clientConfig({
    port,
    clientCss: css,
    clientConfig: config
  });

  const compiler = Webpack(webpackConfig);
  const devServerOptions = { ...webpackConfig.devServer };
  const server = new WebpackDevServer(devServerOptions, compiler);

  server.startCallback(() => {});

  return true;
};

module.exports = {
  startWebpack
};
