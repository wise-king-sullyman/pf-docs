const path = require('path');
const fs = require('fs-extra');

/**
 * Write a component index file from routes.
 *
 * @param {object} params
 * @param {object} params.routes
 * @param {string} params.outputDir
 * @param {string} params.outputFile
 */
const writeIndexFile = ({ routes, outputDir, outputFile = 'index.js' } = {}) => {
  const stringifyRoute = ([route, pageData]) =>
    `'${route}': {\n    ${Object.entries(pageData)
      .map(([key, val]) => `${key}: ${JSON.stringify(val)}`)
      .concat(
        `Component: () => import(/* webpackChunkName: "${route.slice(1)}/index" */ '.${route}')`
      )
      .join(',\n    ')}\n  }`;

  const indexContent = `module.exports = {\n  ${Object.entries(routes)
    .map(stringifyRoute)
    .join(',\n  ')}\n};`;

  fs.outputFileSync(path.join(outputDir, outputFile), indexContent);
  // return exitCode;
};

module.exports = {
  writeIndexFile
};
