const { emptyDirSync } = require('fs-extra');
const { watchMarkdown } = require('./markdown');

const commandStart = options => {
  if (options.outputDir) {
    emptyDirSync(options.outputDir);
  }

  watchMarkdown((options.source && require(options.source)) || options.match, {
    outputDir: options?.outputDir
  });
};

module.exports = {
  commandStart
};
