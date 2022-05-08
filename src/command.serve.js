const { startWebpack } = require('./webpack');
const { bin } = require('../package.json');

const commandServe = options => {
  console.info(`[${Object.keys(bin)[0]}] Serving files`);

  return startWebpack({
    config: (options.config && require(options.config)) || undefined,
    css: (options.css && require(options.css)) || undefined,
    port: options.port
  });
};

module.exports = {
  commandServe
};
