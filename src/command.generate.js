const { setupMarkdown } = require('./markdown');
const { bin } = require('../package.json');

const commandGenerate = options => {
  console.info(`[${Object.keys(bin)[0]}] Generating files...`);

  return setupMarkdown((options.source && require(options.source)) || options.match, {
    outputDir: options?.outputDir
  });
};

module.exports = {
  commandGenerate
};
