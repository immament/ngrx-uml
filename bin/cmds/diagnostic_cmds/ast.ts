import log from 'loglevel';
import { Argv } from 'yargs';

import { printAst } from '../../../src/diagnostic/printAst';

exports.command = 'ast';
exports.desc = 'Print AST for first file in pattern';
exports.builder = (yargs: Argv): unknown => {
    return yargs       
        .option('files', {
            alias: 'f',
            description: 'Glob-like file pattern specifying the filepath for the source files.',
            type: 'string',
            nargs: 1,
            default: 'src/index.ts'
        });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.handler = function (argv: any): void {
    log.debug('AST');
    printAst(argv.files);
};