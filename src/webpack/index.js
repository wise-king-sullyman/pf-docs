const WebpackDevServer = require('webpack-dev-server');
const Webpack = require('webpack');
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
  const webpackConfig = await clientConfig({
    mode: 'development',
    port,
    clientCss: css,
    ...config
  });

  /*
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
  */

  /*
   * object { allowedHosts?, bonjour?, client?, compress?, devMiddleware?, headers?, historyApiFallback?,
   * host?, hot?, http2?, https?, ipc?, liveReload?, magicHtml?, onAfterSetupMiddleware?,
   * onBeforeSetupMiddleware?, onListening?, open?, port?, proxy?, server?, setupExitSignals?,
   * setupMiddlewares?, static?, watchFiles?, webSocketServer? }
   */

  /*
  const server = new WebpackDevServer({}, webpack(webpackConfig));

  server.listen(port, 'localhost', err => {
    if (err) {
      console.error(err);
    }
  });
   */
  const compiler = Webpack(webpackConfig);
  const devServerOptions = { ...webpackConfig.devServer, open: true };
  const server = new WebpackDevServer(devServerOptions, compiler);

  server.startCallback(() => {});

  return true;
};

module.exports = {
  startWebpack
};
