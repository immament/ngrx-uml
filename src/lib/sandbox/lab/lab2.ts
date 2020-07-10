

import log, { LogLevelDesc } from 'loglevel';
import yargs from 'yargs';

import { GeneratorOptions } from '../../services';
import devLogger, { logFnNameWithFile } from '../../utils/logger';

import { Lab2Service } from './services/lab2.service';

const argv = yargs
  .usage('Usage: $0 <command> [options]')
  .strict()
  .option('log', {
    alias: 'l',
    default: 'INFO',
    choices: ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'SILENT']
  })
  .help()
  .alias('help', 'h')
  .argv;
 

logFnNameWithFile(devLogger, log.levels.ERROR );
devLogger.setLevel(argv.log as LogLevelDesc);

devLogger.info('argv:', argv);
log.setLevel('INFO');



const options: GeneratorOptions = {
    baseDir: '../_sandbox_/ngrx-example-app',
    // baseDir: '../_sandbox_/ngrx-example-app-without-node-modules/src',
    // baseDir: __dirname + '/sample_data',
    imageFormat: 'off',
    generateImages: false,
    ignorePattern: ['**/*.spec.ts'],
    tsConfigFileName: 'tsconfig.json',
    saveConvertResultToJson: true,
    saveWsd: false,
    logLevel: 'INFO'
};


// -f '**/*ts' -d  -i '**/*.spec.ts' -c tsconfig.app.json --js
const labService = new Lab2Service(options);


labService.generate('src/**/*.ts');

