const path = require('path');
const { envVariables } = require('./config.plugins.env');
const { htmlWebpackPlugins } = require('./config.plugins.html');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const { _PF_DOCS_OUTPUT_DIR, _PF_DOCS_WEBPACK_DIR } = global;

// ToDo: need to eval best way to pass values towards plugins from config
/**
 * Basic webpack configuration.
 * More information here https://webpack.js.org/guides/asset-modules/
 *
 * @returns {{}}
 */
module.exports = ({ mode } = {}) => ({
  context: _PF_DOCS_WEBPACK_DIR,
  entry: path.join(_PF_DOCS_WEBPACK_DIR, '/app/index.js'),
  output: {
    filename: 'main.js',
    path: path.resolve(_PF_DOCS_OUTPUT_DIR, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        type: 'asset'
      },
      {
        test: /\.(tsx|ts|jsx|js)?$/,
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: true,
            cacheCompression: false,
            presets: [
              [
                '@babel/preset-env',
                {
                  exclude: ['transform-regenerator', 'transform-async-to-generator']
                }
              ]
            ],
            plugins: [
              '@babel/plugin-transform-react-jsx',
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-private-methods',
              '@babel/plugin-proposal-private-property-in-object'
            ]
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      lodash: 'lodash-es'
    },
    modules: [...module.paths]
  },
  resolveLoader: {
    modules: module.paths
  },
  plugins: [
    envVariables({ isProd: mode === 'production' }),
    ...htmlWebpackPlugins({ isProd: mode === 'production' }),
    new CopyWebpackPlugin({
      patterns: [{ from: path.join(_PF_DOCS_WEBPACK_DIR, '/app/assets'), to: 'assets' }]
    }),
    new MonacoWebpackPlugin()
  ]
});
