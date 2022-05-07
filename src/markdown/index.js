const chokidar = require('chokidar');
const { sourcePropsFile } = require('./sourcePropsFile');
const { sourceMarkdownFile } = require('./sourceMarkdownFile');
const { writeIndexFile } = require('./writeIndexFile');

/**
 * Setup file watch
 *
 * @param {object|string} patterns
 * @param {object} options
 * @param {boolean} options.ignoreInitial
 * @param {object} options.routes
 * @param {string} options.outputDir
 */
const watchMarkdown = (patterns, { routes = {}, outputDir, ignoreInitial = true } = {}) => {
  let updatedTsDocs = {};

  const setWatch = (arr, callback) =>
    arr.forEach(({ glob, ignored = [], ...rest } = {}) => {
      const watcher = chokidar.watch(glob, { ignored, ignoreInitial });
      watcher.on('add', file => callback(file, rest));
      watcher.on('change', file => callback(file, rest));
    });

  if (Array.isArray(patterns?.props)) {
    setWatch(patterns?.props, file => {
      updatedTsDocs = sourcePropsFile(file);
    });
  }

  if (typeof patterns === 'string') {
    setWatch([{ glob: patterns }], file => {
      const updated = sourceMarkdownFile({ file, routes, tsDocs: updatedTsDocs, outputDir });
      writeIndexFile({ routes: updated, outputDir });
    });
  }

  if (Array.isArray(patterns?.markdown)) {
    setWatch(patterns?.markdown, (file, { source }) => {
      const updated = sourceMarkdownFile({
        file,
        routes,
        source,
        tsDocs: updatedTsDocs,
        outputDir
      });
      writeIndexFile({ routes: updated, outputDir });
    });
  }
};

module.exports = {
  /*
  sourceProps(glob, ignore) {
    globs.props.push({ glob, ignore });
    sync(glob, { ignore }).forEach(sourcePropsFile);
  },
  sourceMD(glob, source, ignore, buildMode) {
    globs.md.push({ glob, source, ignore });
    sync(glob, { ignore }).forEach(file => sourceMDFile(file, source, buildMode));
  },
  */
  // sourcePropsFile,
  // sourceProps,
  // sourceMarkdownFile,
  // sourceMarkdown,
  // writeIndexFile,
  watchMarkdown
};
