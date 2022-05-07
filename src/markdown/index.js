const chokidar = require('chokidar');
const { sync } = require('glob');
const { sourcePropsFile } = require('./parsers/sourcePropsFile');
const { sourceMarkdownFile } = require('./parsers/sourceMarkdownFile');
const { writeIndexFile } = require('./parsers/writeIndexFile');

/**
 * Match files, apply callback on match.
 *
 * @param {Array} arr
 * @param {Function} callback
 * @return {void}
 */
const fileMatch = (arr, callback) =>
  arr.forEach(({ glob, ignored = [], ...rest } = {}) => {
    sync(glob, { ignore: ignored }).forEach(file => {
      callback(file, rest);
    });
  });

/**
 * Watch files, apply callback on file updates.
 *
 * @param {Array} arr
 * @param {Function} callback
 * @return {void}
 */
const fileWatch = (arr, callback) =>
  arr.forEach(({ glob, ignored = [], ignoreInitial, ...rest } = {}) => {
    const watcher = chokidar.watch(glob, { ignored, ignoreInitial });
    watcher.on('add', file => callback(file, rest));
    watcher.on('change', file => callback(file, rest));
  });

/**
 * Setup markdown files. Default to generateFiles.
 *
 * @param {object|string} patterns
 * @param {object} options
 * @param {Function} options.fileHandler
 * @param {boolean} options.ignoreInitial
 * @param {object} options.routes
 * @param {string} options.outputDir
 * @returns {boolean}
 */
const setupMarkdown = (
  patterns,
  { routes = {}, outputDir, ignoreInitial = true, fileHandler = fileMatch } = {}
) => {
  let updatedTsDocs = {};

  if (Array.isArray(patterns?.props)) {
    fileHandler(patterns?.props, file => {
      updatedTsDocs = sourcePropsFile(file);
    });
  }

  if (typeof patterns === 'string') {
    fileHandler([{ glob: patterns, ignoreInitial }], file => {
      const updated = sourceMarkdownFile({ file, routes, tsDocs: updatedTsDocs, outputDir });
      writeIndexFile({ routes: updated, outputDir });
    });
  }

  if (Array.isArray(patterns?.markdown)) {
    fileHandler(
      patterns?.markdown.map(obj => ({ ignoreInitial, ...obj })),
      (file, { source }) => {
        const updated = sourceMarkdownFile({
          file,
          routes,
          source,
          tsDocs: updatedTsDocs,
          outputDir
        });
        writeIndexFile({ routes: updated, outputDir });
      }
    );
  }

  return true;
};

module.exports = {
  fileMatch,
  fileWatch,
  setupMarkdown
};
