const { setupMarkdown, fileWatch } = require('./markdown');
const { bin } = require('../package.json');

/**
 * File watch for markdown files.
 *
 * @param {object} params
 * @param {string} params.match
 * @param {string} params.outputDir
 * @param {string} params.source
 * @returns {boolean}
 */
const commandWatch = ({ match, outputDir, source } = {}) => {
  console.info(`[${Object.keys(bin)[0]}] Watching files`);

  return setupMarkdown((source && require(source)) || match, {
    fileHandler: fileWatch,
    outputDir
  });
};

module.exports = {
  commandWatch
};
