import log from 'loglevel';
import { Argv } from 'yargs';

import { print } from '../../src/deprecated/print';
import { printVariables } from '../../src/deprecated/printVariable';
import { checkUtils } from '../../src/deprecated/tsutil';

exports.command = 'print [options]';
exports.desc = 'Print ...';
exports.aliases = ['p'];
exports.builder = (yargs: Argv): unknown => {
    return yargs.option('source', {
        alias: 's',
        description: ' Glob-like file pattern specifying the filepath for the source files',
        type: 'string',
        nargs: 1,
        default: 'src/**/*.ts'
    }).option('outDir', {
        alias: 'o',
        description: 'Redirect output structure to the directory',
        type: 'string',
        default: 'out',
        nargs: 1,
    }).option('type', {
        alias: 't',
        type: 'string',
        default: 'print'
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.handler = function (argv: any): void {
    log.debug('PRINT command');

    switch (argv.type) {
        case 'var':
            printVariables(argv.source, argv.outDir);
            break;
        case 'utils':
            checkUtils(argv.source, argv.outDir);
            break;
        default:
            print(argv.source, argv.outDir);
            break;
    }
}