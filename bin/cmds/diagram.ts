import log from 'loglevel';
import { Argv } from 'yargs';

import { CreateActionsDiagramService } from '../../src/services/create-diagram.service';
import { PlantUmlService } from '../../src/services/plant-uml.service';

exports.command = 'diagram [options]';
exports.desc = 'Generate plantUML diagram';
exports.aliases = ['d'];
exports.builder = (yargs: Argv<DiagramOptions>): DiagramOptions => {
    return yargs.option('files', {
        alias: 'f',
        description: 'Glob-like file pattern specifying the filepath for the source files. Relative to baseDir',
        type: 'string',
        nargs: 1,
        default: '**/*.ts'
    }).option('ignore', {
        alias: 'i',
        description: 'Glob-like file pattern specifying files to ignore.',
        array: true,
        default: ['**/*.spec.ts', '**/node_modules/**']
    }).option('imageFormat', {
        alias: 'im',
        description: 'Image format. To turn off image generation set to off',
        choices: ['eps', 'latex', 'png', 'svg', 'txt', 'off'],
        default: 'png',
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
        description: 'tsconfig.json file name with relative path from baseDir',
        type: 'string',
        default: 'tsconfig.json'
    }).option('toJson', {
        alias: 'js',
        description: 'Generate intermediate files to json',
        type: 'boolean',
        default: false
    }).option('wsd', {
        description: 'Generate plant uml file (.wsd);',
        type: 'boolean',
        default: false
    }).option('clickableLinks', {
        alias: 'cl',
        description: 'Convert  terminal links to clickable in vs code terminal',
        type: 'boolean',
        default: false
    }).argv;
};

interface DiagramOptions {
    outDir: string;
    baseDir: string;
    tsConfig: string;
    clickableLinks: boolean;
    imageFormat: string;
    ignore: string[];
    toJson: boolean;
    wsd: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.handler = function (argv: any): void {
    log.trace('Generate diagram..', argv);

    const createDiagramService = new CreateActionsDiagramService(new PlantUmlService, {
        outDir: argv.outDir,
        baseDir: argv.baseDir,
        tsConfigFileName: argv.tsConfig,
        clickableLinks: argv.clickableLinks,
        imageFormat: argv.imageFormat,
        generateImages: argv.imageFormat !== 'off',
        ignorePattern: argv.ignore,
        saveActionsReferencesToJson: argv.toJson,
        saveActionsToJson: argv.toJson,
        saveWsd: argv.wsd
        
    });

    createDiagramService.generateDiagram(argv.files);
};