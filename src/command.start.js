const { watchMarkdown } = require('./markdown');

const commandStart = options => {
  watchMarkdown((options.source && require(options.source)) || options.match);
};

module.exports = {
  commandStart
};
