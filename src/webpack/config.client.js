const path = require('path');
const fs = require('fs');
const { merge } = require('webpack-merge');
const baseConfig = require('./config.base');
const { _PF_DOCS_WEBPACK_DIR, _PF_DOCS_CONTEXT_PWD, _PF_DOCS_OUTPUT_DIR } = global;

/**
 * Merge multiple webpack configurations, minimal defaults and consumer configuration.
 *
 * @param {object} params
 * @param {object} params.clientConfig
 * @param {string} params.clientCss
 * @param {string} params.mode
 * @param {number} params.port
 * @returns {{}}
 */
module.exports = ({ clientConfig = {}, clientCss, mode = 'development', port } = {}) => {
  const base = baseConfig({ mode: clientConfig?.mode || mode });
  const getFilePath = file => (file && fs.existsSync(file) && path.resolve(file)) || false;

  return merge(
    base,
    {
      mode,
      devServer: {
        hot: true,
        historyApiFallback: true,
        open: true,
        port
      },
      watchOptions: {
        aggregateTimeout: 800
      },
      resolve: {
        alias: {
          'generated-pf-docs': path.join(_PF_DOCS_WEBPACK_DIR, 'app'),
          'client-styles': getFilePath(clientCss && path.join(_PF_DOCS_CONTEXT_PWD, clientCss)),
          'client-routes': getFilePath(path.join(_PF_DOCS_OUTPUT_DIR, 'index.es.js'))
        },
        fallback: {
          // 'pf-docs': require.resolve('pf-docs')
        }
      }
    },
    clientConfig
  );
};
