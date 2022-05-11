const path = require('path');
const { envVariables } = require('./config.plugins.env');
const { htmlWebpackPlugins } = require('./config.plugins.html');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const { _PF_DOCS_OUTPUT_DIR, _PF_DOCS_WEBPACK_DIR } = global;

module.exports = ({ isProd = false } = {}) => ({
  entry: path.join(_PF_DOCS_WEBPACK_DIR, '/app/index.js'),
  output: {
    filename: 'main.js',
    path: path.resolve(_PF_DOCS_OUTPUT_DIR, 'dist')
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        // More information here https://webpack.js.org/guides/asset-modules/
        type: 'asset'
      },
      {
        test: /\.(tsx|ts|jsx|js)?$/,
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: true,
            cacheCompression: false,
            presets: [['@babel/preset-env']],
            plugins: [
              '@babel/plugin-transform-react-jsx',
              '@babel/plugin-proposal-class-properties'
            ]
          }
        }
      }
      /*
      {
        test: /\.css$/,
        include: [],
        use: [
          // { loader: MiniCssExtractPlugin.loader },
          { loader: require.resolve('style-loader') },
          { loader: require.resolve('css-loader') }
          /*
          {
            loader: require.resolve('postcss-loader'),
            options: {
              postcssOptions: {
                ident: 'postcss',
                config: false,
                plugins: [
                  'postcss-flexbugs-fixes',
                  [
                    'postcss-preset-env',
                    {
                      autoprefixer: {
                        flexbox: 'no-2009'
                      },
                      stage: 3
                    }
                  ],
                  'postcss-normalize'
                ]
              }
            }
          }
           * /
        ]
      }
      */
    ]
  },
  resolve: {
    // Allow importing client routes
    alias: {
      // 'client-styles': path.resolve(process.cwd(), 'patternfly-docs.css.js'),
      lodash: 'lodash-es'
    },
    modules: [...module.paths]
  },
  resolveLoader: {
    modules: module.paths
  },
  plugins: [
    envVariables(),
    ...htmlWebpackPlugins(),
    /*
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[name].[contenthash].css'
    }),
    */
    new CopyWebpackPlugin({
      patterns: [
        { from: path.join(_PF_DOCS_WEBPACK_DIR, '/app/assets'), to: 'assets' }
        // { from: path.join(_PF_DOCS_WEBPACK_DIR, '/app/assimages'), to: 'assets/images' },
        // { from: path.join(_PF_DOCS_WEBPACK_DIR, '/app/fonts'), to: 'assets/fonts' }
      ]
    })
  ]
});
