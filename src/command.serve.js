const { startWebpack } = require('./webpack');
const { bin } = require('../package.json');

/**
 * Serve your generated files in a prepackaged app.
 *
 * @param {object} params
 * @param {string} params.css
 * @param {object} params.config
 * @param {number} params.port
 * @returns {boolean}
 */
const commandServe = ({ css, config, outputDir, port } = {}) => {
  console.info(`[${Object.keys(bin)[0]}] Serving files`);

  return startWebpack({
    config: (config && require(config)) || undefined,
    css,
    outputDir,
    port
  });
};

module.exports = {
  commandServe
};
