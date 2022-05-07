const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { prerender } = require('./config.prerender');
const { getTitle } = require('./helpers/getTitle');
// const { routes, fullscreenRoutes } = require('./config.routes');
const { getGeneratedRoutes, getFullScreenRoutes } = require('./config.routes');
const { _PF_DOCS_WEBPACK_DIR } = global;

/**
 * Get and set a html like file.
 * - Don't use GA in dev
 * - Don't prerender fullscreen pages
 *
 * @param {object} params
 * @param {boolean} params.isProd
 * @param {*} params.googleAnalyticsID
 * @param {*} params.algolia
 * @param {string} params.url
 * @param {string} params.title
 * @param {string} params.template
 * @returns {*}
 */
const getHtmlFileWebpackPlugin = ({
  isProd = false,
  googleAnalyticsID,
  algolia,
  // pathPrefix = '',
  url,
  title,
  // isFullscreen,
  template = path.join(_PF_DOCS_WEBPACK_DIR, '/templates/html.ejs')
} = {}) =>
  new HtmlWebpackPlugin({
    template,
    filename: `${url}/index.html`.replace(/^\/+/, ''),
    templateParameters: {
      title: getTitle(title),
      prerendering: 'Loading...',
      // prerendering: isProd && !isFullscreen ? await prerender(url, pathPrefix) : 'Loading...',
      googleAnalyticsID: isProd ? googleAnalyticsID : false,
      algolia
    },
    scriptLoading: 'defer',
    inject: false,
    minify: false
  });

/**
 * Get the site map html plugin
 *
 * @param {object} params
 * @param {string} params.template
 * @param {Function} params.getRoutes
 * @returns {*}
 */
const getHtmlSiteMapWebpackPlugin = ({
  template = path.join(_PF_DOCS_WEBPACK_DIR, '/templates/sitemap.ejs'),
  getRoutes = getGeneratedRoutes
} = {}) =>
  new HtmlWebpackPlugin({
    template,
    filename: 'sitemap.xml',
    templateParameters: {
      urls: Object.entries(getRoutes())
        .map(([path, { sources }]) => [
          path,
          ...(sources || []).slice(1).map(source => source.slug)
        ])
        .flat()
    },
    inject: false,
    minify: false
  });

/**
 * Set available route paths.
 *
 * @param {object} params
 * @param {Function} params.getRoutes
 * @param {Function} params.getFullscreenRoutes
 * @returns {[]}
 */
const setHtmlRoutesWebpackPlugins = ({
  getRoutes = getGeneratedRoutes,
  getFullscreenRoutes = getFullScreenRoutes
} = {}) =>
  Object.entries(getRoutes())
    .concat(Object.entries(getFullscreenRoutes()))
    .map(([url, { sources = [], title, isFullscreen }]) => [
      [url, { title, isFullscreen }],
      // Add pages for sources
      ...sources.slice(1).map(source => [source.slug, source])
    ])
    .flat()
    .sort();

/**
 * Get and set all available HTML related plugins.
 *
 * @param {object} params
 * @param {boolean} params.isProd
 * @param {object} params.options
 * @returns {Promise<*[]>}
 */
const htmlWebpackPlugins = ({ isProd = false, ...options } = {}) => {
  process.stdout.write('Loading HTML plugins...');
  const response = [];
  if (isProd) {
    response.push(getHtmlSiteMapWebpackPlugin(options));
  }

  // Only render the index page in dev mode and use historyApiFallback
  if (!isProd) {
    response.push(getHtmlFileWebpackPlugin({ isProd, url: '', title: 'Dev', ...options }));
    process.stdout.write(`DONE\n`);
    return response;
  }

  const titledRoutes = setHtmlRoutesWebpackPlugins();
  titledRoutes.forEach(async ([url, { title, isFullscreen }]) =>
    response.push(getHtmlFileWebpackPlugin({ url, title, isFullscreen, ...options }))
  );

  process.stdout.write(`DONE\n`);
  return response;
};

module.exports = {
  getHtmlFileWebpackPlugin,
  getHtmlSiteMapWebpackPlugin,
  htmlWebpackPlugins
};
