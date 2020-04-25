#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-use-before-define */

import log from 'loglevel';
import yargs from 'yargs';

import { getCommandFilesExtensionsForEnvironment, prepareTraceLogger } from '../lib/utils/utils';

yargs
  .usage('Usage: $0 <command> [options]')
  .strict()
  .commandDir('cmds', { extensions: getCommandFilesExtensionsForEnvironment() })
  .option('log', {
    alias: 'l',
    default: 'INFO',
    choices: ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'SILENT']
  })
  .help()
  .alias('help', 'h')
  .example('$0 diagram -f "src/**/*.ts"', 'Generate plantUML diagram')
  .demandCommand()
  .wrap(100)
  .middleware([prepare])
  .argv;


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function prepare(argv: any): void {
  log.setLevel(argv.log);  
  log.debug('prepare - log level:', argv.log);
  prepareTraceLogger();
}