const { setupMarkdown } = require('./markdown');

const commandGenerate = options => {
  setupMarkdown((options.source && require(options.source)) || options.match, {
    outputDir: options?.outputDir
  });
};

module.exports = {
  commandGenerate
};
