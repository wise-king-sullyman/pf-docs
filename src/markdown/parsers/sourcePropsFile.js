const { tsDocgen } = require('./tsDocgen');

/**
 * Get props from file.
 *
 * @param {string} file
 * @returns {{}}
 */
const sourcePropsFile = file => {
  const tsDocs = {};

  tsDocgen(file)
    .filter(({ hide }) => !hide)
    .forEach(({ name, description, props }) => {
      tsDocs[name] = { name, description, props };
    });

  return tsDocs;
};

module.exports = {
  sourcePropsFile
};
