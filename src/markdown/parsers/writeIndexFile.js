const path = require('path');
const fs = require('fs-extra');

/**
 * Write a component index file from routes.
 *
 * @param {object} params
 * @param {object} params.routes
 * @param {string} params.outputDir
 * @param {string} params.commonOutputFile
 * @param {string} params.esOutputFile
 */
const writeIndexFile = ({
  routes,
  outputDir,
  commonOutputFile = 'index.js',
  esOutputFile = 'index.es.js'
} = {}) => {
  const stringifyRoute = ([route, pageData]) =>
    `'${route}': {\n    ${Object.entries(pageData)
      .map(([key, val]) => `${key}: ${JSON.stringify(val)}`)
      .concat(
        //  `Component: () => import(/* webpackChunkName: "${route.slice(1)}/index" */ '.${route}')`
        `Component: () => import(/* webpackChunkName: "${route.slice(1)}" */ '.${route}')`
      )
      .join(',\n    ')}\n  }`;

  const commonIndexContent = `module.exports = {\n  ${Object.entries(routes)
    .map(stringifyRoute)
    .join(',\n  ')}\n};`;

  fs.outputFileSync(path.join(outputDir, commonOutputFile), commonIndexContent);

  const esIndexContent = `export const routes = {\n  ${Object.entries(routes)
    .map(stringifyRoute)
    .join(',\n  ')}\n};`;

  fs.outputFileSync(path.join(outputDir, esOutputFile), esIndexContent);
};

module.exports = {
  writeIndexFile
};
