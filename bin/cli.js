#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const { emptyDirSync } = require('fs-extra');
const {commandWatch} = require("../src/command.watch");

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
 * Declare an empty global for reference, and setting a port configuration in the future.
 *
 * @type {number}
 * @private
 */
const _PF_DOCS_PORT_OPT = (global._PF_DOCS_PORT_OPT = 8003);

/**
 * Core options, applicable to all commands.
 */
program
  .option('-c, --config [path]', 'set a server config file path')
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
    path.join(_PF_DOCS_CONTEXT_PWD, '/pf-docs')
  )
  .option('-p, --port <port>', 'set webpack port', _PF_DOCS_PORT_OPT)
  .option('-s, --source [path]', 'set a markdown file path, with props and markdown globs');

/**
 * Start command. Start a local server, generate and watch files with PF themed documentation.
 */
program
  .command('start')
  .option('-p, --port <port>', 'set webpack port', _PF_DOCS_PORT_OPT)
  .description('generates components, watches files, and runs webpack-dev-server')
  .action(localOptions => {
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
    commandGenerate(options);
    commandWatch(options);
    commandServe(options);
  });

/**
 * Generate command. Generate PF themed components for bundling.
 */
program
  .command('generate')
  .description('generates components from markdown')
  .action(localOptions => {
    const options = { ...program.opts(), ...localOptions };

    if (options.source) {
      delete options.match;
    }

    if (options.outputDir) {
      emptyDirSync(options.outputDir);
    }

    const { commandGenerate } = require('../src/command.generate');
    commandGenerate(options);
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
    commandServe(options);
  });

/**
 * Watch command. Watch markdown files, then generate PF themed components for bundling.
 */
program
  .command('watch')
  .description('watches markdown files')
  .action(localOptions => {
    const options = { ...program.opts(), ...localOptions };

    if (options.source) {
      delete options.match;
    }

    if (options.outputDir) {
      emptyDirSync(options.outputDir);
    }

    const { commandWatch } = require('../src/command.watch');
    commandWatch(options);
  });

/**
 * Initialize program.
 */
program.parse();
