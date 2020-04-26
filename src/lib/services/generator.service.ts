import chalk from 'chalk';
import { createWriteStream, existsSync, mkdirSync, WriteStream } from 'fs';
import log from 'loglevel';
import path from 'path';
import ts from 'typescript';

import {
    ActionReferenceConvertContextFactory
} from '../action-references/converters/action-reference-convert.context';
import { ActionReference } from '../action-references/models/action-reference.model';
import { ActionConvertContextFactory } from '../actions/converters/action-convert.context';
import { Action } from '../actions/models/action.model';
import { ActionReferenceRenderer, ActionRenderer } from '../actions/renderer/items';
import { Converter } from '../converters/converter';
import { TypeKind } from '../converters/models';
import { Renderer } from '../renderers';
import { globSync } from '../utils/glob';
import { createTsProgram } from '../utils/tsutils';
import {
    getKeyReplacer, removeiIlegalCharacters, writeJsonToFile, writeToFile
} from '../utils/utils';

import { GeneratorOptions } from './generator-options';
import { PlantUmlService } from './plant-uml.service';

export class GeneratorService {

    public options: GeneratorOptions = {
        saveActionsToJson: false,
        saveActionsReferencesToJson: false,
        saveWsd: false,
        outDir: '/out',
        baseDir: '',
        tsConfigFileName: 'tsconfig.json',
        clickableLinks: false,
        ignorePattern: '../**/*spec.ts',
        generateImages: true
    }

    constructor(
        private readonly plantUmlService: PlantUmlService,
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

        const sourceFilePattern = this.options.baseDir + filesPattern;
        log.debug(chalk.yellow('sourceFilePattern:'), sourceFilePattern);
        log.debug(chalk.yellow('baseDir:'), this.options.baseDir);
        log.debug(chalk.yellow('tsConfig:'), this.options.tsConfigFileName);
        log.debug('options', this.options);

        const files = globSync(sourceFilePattern, {
            ignore: this.options.ignorePattern
        });

        log.debug('glob result', files);

        if (this.options.baseDir == null || !this.options.tsConfigFileName || !this.options.outDir) {
            log.warn(`baseDir [${this.options.baseDir}] & tsConfigFileName [${this.options.tsConfigFileName}] & outDir [${this.options.outDir}] must be specified`);

            return;
        }

        const program = createTsProgram(files, this.options.baseDir, this.options.tsConfigFileName);
        const typeChecker = program.getTypeChecker();

        const converter = new Converter();

        const actionsMap = this.convertActions(converter, program, typeChecker, this.options.outDir);
        if (!actionsMap) {
            log.info('No actions found');
            return;
        }

        this.convertReferences(converter, program, typeChecker, this.options.outDir, actionsMap);
        const actions = [...actionsMap.values()];
        this.render(actions, this.options.outDir);
    }

    private convertActions(converter: Converter, program: ts.Program, typeChecker: ts.TypeChecker, outDir: string): Map<ts.Symbol, Action> | undefined {
        const actionsMap = converter.convert(new ActionConvertContextFactory(), program, typeChecker) as Map<ts.Symbol, Action>;

        log.info(chalk.yellow(`Found ${actionsMap.size} actions`));
        if (!actionsMap || actionsMap.size === 0) {
            return;
        }

        this.saveActions([...actionsMap.values()], outDir, '/actions.json');
        return actionsMap;
    }

    private convertReferences(converter: Converter, program: ts.Program, typeChecker: ts.TypeChecker, outDir: string, actionsMap: Map<ts.Symbol, Action>): void {
        const actionsReferences = converter.convert(new ActionReferenceConvertContextFactory(actionsMap), program, typeChecker) as ActionReference[];

        log.info(chalk.yellow(`Found ${actionsReferences.length} action's references`));

        this.saveActions([...actionsMap.values()], outDir, '/actions-with-references.json');
        this.saveReferences(actionsReferences, outDir, '/actions-references.json');

    }

    private render(actions: Action[], outDir: string): void {

        const renderer = new Renderer({
            [TypeKind.Action]: new ActionRenderer,
            [TypeKind.ActionReference]: new ActionReferenceRenderer,
        });


        renderer.onItemRendered.subscribe(({ item, output }) => {
            if (item instanceof Action) {
                this.save(item, output, outDir);
            }
        });

        renderer.render(actions);

    }

    private save(item: Action, content: string, outDir: string): void {
        const diagram = this.createDiagram(item.name, content);
        const fileName = removeiIlegalCharacters(item.name, this.options.clickableLinks);
        this.writeWsdToFile(item.name, diagram, path.join(outDir, 'wsd'));
        if (this.options.imageFormat) {
            this.renderToImageFile(outDir, diagram, fileName, this.options.imageFormat);
        }

    }

    public renderToImageFile(outDir: string, diagram: string, fileName: string, ext: string): void {
        if (!this.options.generateImages) {
            return;
        }

        if (!existsSync(outDir)) {
            mkdirSync(outDir);
        }
        const writeStream = this.createWriteStream(outDir, fileName, ext);
        this.plantUmlService.renderImage(ext, diagram, writeStream);
    }

    private createWriteStream(outDir: string, fileName: string, extension: string): WriteStream {
        const filePath = path.format({
            dir: outDir, name: fileName, ext: '.' + extension
        });
        const fileStream: WriteStream = createWriteStream(filePath);
        fileStream.once('close', () => {
            log.info(`Diagram image saved: ${chalk.cyan(filePath)} `);
        });
        return fileStream;

    }

    private writeWsdToFile(name: string, diagram: string, outDir: string): void {
        if (this.options.saveWsd) {
            writeToFile(diagram, outDir, removeiIlegalCharacters(name, this.options.clickableLinks) + '.wsd');
        }
    }


    private createDiagram(name: string, diagramContent: string): string {
        return `@startuml ${name}

        set namespaceSeparator ::

        ${diagramContent} 

        @enduml`;
    }

    private saveActions(actions: Action[], outDir: string, fileName: string, ): void {
        if (this.options.saveActionsToJson) {
            writeJsonToFile(actions, outDir, fileName, getKeyReplacer('action'));
            log.debug(`Actions saved to ${chalk.gray(`${outDir}${fileName}`)}`);
        }
    }


    private saveReferences(actionsReferences: ActionReference[], outDir: string, fileName: string): void {
        if (this.options.saveActionsReferencesToJson) {
            writeJsonToFile(actionsReferences, outDir, fileName, getKeyReplacer('action'));
            log.debug(`Action's references saved to ${chalk.gray(`${outDir}${fileName}`)}`);
        }
    }


}