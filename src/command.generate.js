const { setupMarkdown } = require('./markdown');
const { bin } = require('../package.json');

/**
 * Generate files for packaging.
 *
 * @param {object} params
 * @param {string} params.match
 * @param {string} params.outputDir
 * @param {string} params.source
 * @returns {boolean}
 */
const commandGenerate = ({ match, outputDir, source } = {}) => {
  console.info(`[${Object.keys(bin)[0]}] Generating files...`);

  return setupMarkdown((source && require(source)) || match, {
    outputDir
  });
};

module.exports = {
  commandGenerate
};
