import log from 'loglevel';
import { Argv } from 'yargs';

import { printAstVariablesInProgram } from '../../../src/diagnostic/printAstInProgram';

exports.command = 'ast-variables';
exports.desc = 'Create typescript program using tsconfig and print AST variables for one file';
exports.aliases = ['astv'];
exports.builder = (yargs: Argv): unknown => {
    return yargs
        .option('source', {
            alias: 's',
            description: 'Glob-like file pattern specifying the filepath for the source files. Only first file will be use.',
            type: 'string',
            nargs: 1,
            default: 'src/**/*.ts'
        }).option('baseDir', {
            alias: 'd',
            description: 'Path to project base directory',
            type: 'string',
            default: './'
        }).option('tsConfig', {
            alias: 'c',
            description: 'tsconfig file name with relative path from baseDir',
            type: 'string',
            default: 'tsconfig.json'
        })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.handler = function (argv: any): void {
    log.debug('ast-program');
    printAstVariablesInProgram(argv.source, argv.baseDir, argv.tsConfig);
}