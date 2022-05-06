#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');

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
 * Start command. Start a local server with PF themed documentation.
 */
program
  .command('start')
  .option('-p, --port <port>', 'set webpack port', _PF_DOCS_PORT_OPT)
  .description('generates source files, and runs webpack-dev-server')
  .action(localOptions => {
    const options = { ...program.opts(), ...localOptions };
    const { start } = require('../src/start');
    console.log();
    start(options);
  });

/**
 * Initialize program.
 */
program.parse();
