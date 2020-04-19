import log from 'loglevel';
import { Argv } from 'yargs';

import { testPlantServer } from '../../../src/diagnostic/testPlantServer';

exports.command = 'testplant';
exports.desc = 'Generate test diagram using plant server';
exports.aliases = ['tp'];
exports.builder = (yargs: Argv): unknown => {
    return yargs
        .option('outDir', {
            alias: 'o',
            description: 'Path to output directory',
            type: 'string',
            nargs: 1
        });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.handler = function (argv: any): void {

    log.debug('testplant', argv.outDir);

    testPlantServer(argv.outDir);
}