const { merge } = require('webpack-merge');
const baseConfig = require('./config.base');

module.exports = ({ clientCss, mode }) => {
  const base = baseConfig();
  return merge(base, {
    mode,
    resolve: {
      alias: {
        'client-styles':
          (clientCss && require.resolve(clientCss)) || require.resolve('./app/client.css')
      }
    }
  });
};
