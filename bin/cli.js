#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const { emptyDirSync } = require('fs-extra');

/**
 * Set consumer project/repo path.
 *
 * @type {string}
 * @private
 */
const _PF_DOCS_CONTEXT_PWD = (global._PF_DOCS_CONTEXT_PWD = process.cwd());

/**
 * Set pf-docs node_module path.
 *
 * @type {string}
 * @private
 */
const _PF_DOCS_PACKAGE_PWD = (global._PF_DOCS_PACKAGE_PWD = path.join(__dirname, '..'));

/**
 * Set a consistent output directory.
 *
 * @type {string}
 * @private
 */
const _PF_DOCS_OUTPUT_DIR = (global._PF_DOCS_OUTPUT_DIR = path.join(
  _PF_DOCS_CONTEXT_PWD,
  '/pf-docs'
));

/**
 * Set a consistent webpack base directory.
 *
 * @type {string}
 * @private
 */
const _PF_DOCS_WEBPACK_DIR = (global._PF_DOCS_WEBPACK_DIR = path.join(
  _PF_DOCS_PACKAGE_PWD,
  '/src/webpack'
));

/**
 * Declare an empty global for reference, and setting a port configuration in the future.
 *
 * @type {number}
 * @private
 */
const _PF_DOCS_PORT_OPT = (global._PF_DOCS_PORT_OPT = 8003);

const _PF_DOCS_GENERATE = (global._PF_DOCS_GENERATE = undefined);

const _PF_DOCS_SERVE = (global._PF_DOCS_SERVE = undefined);

const _PF_DOCS_WATCH = (global._PF_DOCS_WATCH = undefined);

/**
 * Core options, applicable to all commands.
 */
program
  .option('-c, --config [path]', 'set a webpack 5 config file path')
  .option('-d, --css [path]', 'set a css file path, with css imports')
  // .option('-r, --routes [path]', 'set a routes file path')
  .option(
    '-m, --match <glob>',
    'match markdownfiles',
    path.join(_PF_DOCS_CONTEXT_PWD, '/**/__docs__/**/*.md')
  )
  .option(
    '-o, --outputDir <path>',
    'default directory where pf-docs places all output',
    _PF_DOCS_OUTPUT_DIR
  )
  .option('-p, --port <port>', 'set webpack port', _PF_DOCS_PORT_OPT)
  .option('-s, --source [path]', 'set a markdown file path, with props and markdown globs');

/**
 * Start command. Start a local server, generate and watch files with PF themed documentation.
 */
program
  .command('start')
  // .option('-p, --port <port>', 'set webpack port', _PF_DOCS_PORT_OPT)
  .description('generates components, watches files, and runs webpack-dev-server')
  .action(async localOptions => {
    const options = { ...program.opts(), ...localOptions };

    if (options.source) {
      delete options.match;
    }

    if (options.outputDir) {
      emptyDirSync(options.outputDir);
    }

    const { commandGenerate } = require('../src/command.generate');
    const { commandWatch } = require('../src/command.watch');
    const { commandServe } = require('../src/command.serve');

    global._PF_DOCS_GENERATE = await commandGenerate(options);
    global._PF_DOCS_WATCH = await commandWatch(options);

    commandServe(options);

    // if (_PF_DOCS_GENERATE && _PF_DOCS_WATCH) {
    // commandServe(options);
    // console.log('>>>>>>>>> SERVE FILES');
    // }
  });

/**
 * Generate command. Generate PF themed components for bundling.
 */
program
  .command('generate')
  .description('generates components from markdown')
  .action(async localOptions => {
    const options = { ...program.opts(), ...localOptions };

    if (options.source) {
      delete options.match;
    }

    if (options.outputDir) {
      emptyDirSync(options.outputDir);
    }

    const { commandGenerate } = require('../src/command.generate');
    global._PF_DOCS_GENERATE = await commandGenerate(options);
  });

/**
 * Serve command. Serve PF themed components.
 */
program
  .command('serve')
  .description('serves component files')
  .action(localOptions => {
    const options = { ...program.opts(), ...localOptions };

    if (options.source) {
      delete options.match;
    }

    if (options.outputDir) {
      emptyDirSync(options.outputDir);
    }

    const { commandServe } = require('../src/command.serve');
    global._PF_DOCS_SERVE = commandServe(options);
  });

/**
 * Watch command. Watch markdown files, then generate PF themed components for bundling.
 */
program
  .command('watch')
  .description('watches markdown files')
  .action(async localOptions => {
    const options = { ...program.opts(), ...localOptions };

    if (options.source) {
      delete options.match;
    }

    if (options.outputDir) {
      emptyDirSync(options.outputDir);
    }

    const { commandWatch } = require('../src/command.watch');
    global._PF_DOCS_WATCH = await commandWatch(options);
  });

/**
 * Initialize program.
 */
program.parse();
