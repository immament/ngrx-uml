import { Argv } from 'yargs';

import { getCommandFilesExtensionsForEnvironment } from '../../lib/utils/utils';

exports.command = 'diagnostic';
exports.desc = 'Diagnostic tools';
exports.aliases = ['di'];
exports.builder = (yargs: Argv): unknown => {
    return yargs.demandCommand().commandDir(
        'diagnostic_cmds',
        { extensions: getCommandFilesExtensionsForEnvironment() }
    );
};