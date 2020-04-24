import log from 'loglevel';
import { Argv } from 'yargs';

import { CreateActionsDiagramService } from '../../src/services/create-diagram.service';
import { PlantUmlService } from '../../src/services/plant-uml.service';

exports.command = 'diagram [options]';
exports.desc = 'Generate plantUML diagram';
exports.aliases = ['d'];
exports.builder = (yargs: Argv): unknown => {
    return yargs.option('files', {
        alias: 'f',
        description: 'Glob-like file pattern specifying the filepath for the source files. Relative to baseDir',
        type: 'string',
        nargs: 1,
        default: 'src/**/*.ts'
    }).option('outDir', {
        alias: 'o',
        description: 'Redirect output structure to the directory',
        type: 'string',
        default: 'out',
        nargs: 1,
    }).option('baseDir', {
        alias: 'd',
        description: 'Path to project base directory',
        default: '',
        type: 'string',
    }).option('tsConfig', {
        alias: 'c',
        description: 'tsconfig file name with relative path from baseDir',
        type: 'string',
        default: 'tsconfig.json'
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.handler = function (argv: any): void {
    log.debug('Generate diagram..');

    const createDiagramService = new CreateActionsDiagramService(new PlantUmlService, {
        outDir: argv.outDir,
        baseDir: argv.baseDir,
        tsConfigFileName: argv.tsConfig
    });

    createDiagramService.generateDiagram(argv.files);
};