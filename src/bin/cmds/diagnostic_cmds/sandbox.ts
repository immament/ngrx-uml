import log from 'loglevel';
import { Argv } from 'yargs';

import { ModulesService } from '../../../lib/sandbox/modules.service';
import { GeneratorOptions } from '../../../lib/services';

exports.command = 'sandbox';
exports.desc = 'Generate test diagram using plant server';
exports.aliases = ['s'];
exports.builder = (yargs: Argv<DiagramOptions>): DiagramOptions => {
    return yargs.option('files', {
        alias: 'f',
        description: 'Glob-like file pattern specifying the filepath for the source files. Relative to baseDir. \nIMPORTANT!! Use with quote (" or \')',
        type: 'string',
        nargs: 1,
        default: '**/*.ts'
    }).option('ignore', {
        alias: 'i',
        description: 'Glob-like file pattern specifying files to ignore. \nIMPORTANT!! Use with quote (" or \')',
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
    }).example('$0 diagram -f "src/**/*.ts"', 'Generate plantUML diagram using source files')
        .argv;
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
    files: string;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.handler = function (argv: any): void {

    log.debug('sandbox');


    const options: GeneratorOptions = {
        outDir: argv.outDir,
        baseDir: argv.baseDir,
        tsConfigFileName: argv.tsConfig,
        clickableLinks: argv.clickableLinks,
        imageFormat: argv.imageFormat,
        generateImages: argv.imageFormat !== 'off',
        ignorePattern: argv.ignore,
        saveWsd: argv.wsd,
        saveConvertResultToJson: argv.toJson
    };


    const service = new ModulesService(options);

    service.generate(argv.files);
};