const { setupMarkdown, fileWatch } = require('./markdown');

const commandStart = options => {
  setupMarkdown((options.source && require(options.source)) || options.match, {
    fileHandler: fileWatch,
    outputDir: options?.outputDir
  });
};

module.exports = {
  commandStart
};
