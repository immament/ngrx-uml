import log from 'loglevel';
import { Argv } from 'yargs';

import testPlantServer from '../../../lib/diagnostic/testPlantServer';

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
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.handler = function (argv: any): void {

    log.debug('testplant');

    testPlantServer(argv.outDir);
};