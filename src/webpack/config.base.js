const path = require('path');
const { _PF_DOCS_OUTPUT_DIR, _PF_DOCS_WEBPACK_DIR } = global;

module.exports = {
  entry: path.join(_PF_DOCS_WEBPACK_DIR, '/app/app.js'),
  output: {
    filename: 'main.js',
    path: path.resolve(_PF_DOCS_OUTPUT_DIR, 'dist')
  }
};
