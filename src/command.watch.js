const { setupMarkdown, fileWatch } = require('./markdown');
const { bin } = require('../package.json');

const commandWatch = options => {
  console.info(`[${Object.keys(bin)[0]}] Watching files`);

  return setupMarkdown((options.source && require(options.source)) || options.match, {
    fileHandler: fileWatch,
    outputDir: options?.outputDir
  });
};

module.exports = {
  commandWatch
};
