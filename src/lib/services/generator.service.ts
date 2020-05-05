import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

import { ConvertContext, ConvertContextFactory } from '../converters';
import { Converter } from '../converters/converter';
import { NamedConvertedItem, TypeKind } from '../converters/models';
import { Output } from '../outputs/output';
import { Renderer, RenderResult } from '../renderers';
import { globSync } from '../utils/glob';
import { createTsProgram } from '../utils/tsutils';
import { writeToFile } from '../utils/utils';

import { GeneratorOptions } from './generator-options';
import { PlantUmlOutputService } from './plant-uml.service';

export class GeneratorService {

    public options: GeneratorOptions = {
        saveConvertResultToJson: false,
        saveWsd: false,
        outDir: '/out',
        baseDir: '',
        tsConfigFileName: 'tsconfig.json',
        clickableLinks: false,
        ignorePattern: '../**/*spec.ts',
        generateImages: true
    }

    constructor(
        private readonly plantUmlService: PlantUmlOutputService,
        private readonly convertFactories: ConvertContextFactory[],
        private readonly renderer: Renderer,
        private readonly outputs: Output[],
        options?: GeneratorOptions,
    ) {

        if (options) {
            this.options = { ...this.options, ...options };
        }

        if (this.options.logLevel) {
            log.setLevel(this.options.logLevel);
        }
    }

    generate(filesPattern: string): void {

        log.info('Starting...');
        log.debug(chalk.yellow('filePattern:'), filesPattern);
        log.debug(chalk.yellow('baseDir:'), this.options.baseDir);
        log.debug(chalk.yellow('tsConfig:'), this.options.tsConfigFileName);
        log.debug('options', this.options);

        if (this.options.baseDir == null || !this.options.tsConfigFileName || !this.options.outDir) {
            log.warn(`baseDir [${this.options.baseDir}] & tsConfigFileName [${this.options.tsConfigFileName}] & outDir [${this.options.outDir}] must be specified`);
            return;
        }

        if (!this.options.baseDir.endsWith('/')) {
            this.options.baseDir += '/';
        }
        const program = this.createTsProgram(filesPattern, this.options.baseDir, this.options.tsConfigFileName);
        const convertedItems = this.convert(program, this.options.outDir);
        log.info('Items converted');

        if (!convertedItems) { return; }

        const renderResult = this.render(convertedItems);
        log.info('Items rendered');

        if (!renderResult) { return; }

        this.transform(renderResult);
    }


    private createTsProgram(filesPattern: string, baseDir: string, tsConfigFileName: string): ts.Program {
        const sourceFilePattern = this.options.baseDir + filesPattern;
        const files = globSync(sourceFilePattern, {
            ignore: this.options.ignorePattern
        });
        log.debug('Glob result', files);
        const program = createTsProgram(files, baseDir, tsConfigFileName);
        return program;
    }

    private convert(program: ts.Program, outDir: string): Map<TypeKind, NamedConvertedItem[]> | undefined {
        const converter = new Converter();
        const typeChecker = program.getTypeChecker();
        let converterResult: Map<TypeKind, NamedConvertedItem[]> | undefined = undefined;
        let lastContext: ConvertContext | undefined = undefined;
        for (const contextFactory of this.convertFactories) {
            const context = contextFactory.create(program, typeChecker, converter, lastContext);
            converterResult = converter.convert(context, program);
            this.saveConvertResult(context, outDir);
            lastContext = context;
        }
        return converterResult;
    }


    private saveConvertResult(context: ConvertContext, outDir: string): void {
        if (this.options.saveConvertResultToJson) {
            const result = context.serializeResultToJson();
            if (result) {
                for (const { kind, json } of result) {
                    const filePath = writeToFile(json, outDir, `${context.name}_${kind}.json`);
                    log.info(`Convert result saved to: ${chalk.gray(filePath)}`);

                }
            }
        }
    }

    private render(items: Map<TypeKind, NamedConvertedItem[]>): RenderResult[] | undefined {
        return this.renderer.render(items);
    }

    private transform(input: RenderResult[]): void {
        for (const output of this.outputs) {
            output.transform(input);
        }
    }

}