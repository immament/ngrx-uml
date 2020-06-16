import chalk from 'chalk';
import log from 'loglevel';
import { Program, SyntaxKind, TypeChecker } from 'typescript';

import { ConvertContext, ConvertContextFactory, Converter } from '../../core/converters';
import { TypeKind } from '../../core/converters/models';
import { ItemConvertContext } from '../../impl/converters/item-convert.context';
import {
    ActionsPlantDiagramRenderFactory
} from '../../impl/renderers/actions-plant-diagram-renderer.factory';
import { GeneratorOptions, GeneratorService } from '../../services';

import { SymbolConverter } from './symbol.converter';

export class SymbolsConvertContextFactory implements ConvertContextFactory {

    create(program: Program, typeChecker: TypeChecker, converter: Converter, _lastContext?: ConvertContext): ConvertContext {
        this.configureConverter(converter);
        return new ItemConvertContext(
            'Symbols',
            program,
            typeChecker,
            converter,
            [TypeKind.Unknown, TypeKind.Reducer, TypeKind.NgModule, TypeKind.RegisteredReducer],
            undefined,
            this.onFinish
        );
    }

    configureConverter(converter: Converter): void {
        converter.registerConverters({
            [SyntaxKind.SourceFile]: [new SymbolConverter],
            //   [SyntaxKind.CallExpression]: [new RegisterReducerCallConverter]
        }, {});
        // TODO: temporary filter
        // converter.nodeFilter = (node: ts.Node): boolean => !node.getSourceFile().fileName.includes('/ngrx/modules/');
        // node.getSourceFile().fileName.includes('books.module.ts');         
    }

    private onFinish(context: ItemConvertContext): void {

        const result = context.getRawResult();
        if (!result.size) {
            log.info(chalk.yellow(`Nothing found in context: ${context.name}`));
        }

        for (const [kind, map] of result.entries()) {
            log.info(`Found: ${map.size} ${TypeKind[kind]}s`);
        }

    }
}



export class SymbolsService {

    constructor(private options: GeneratorOptions) {}
    
    generate(filesPattern: string): Promise<void> {

        const generateService = new GeneratorService(
            [ new SymbolsConvertContextFactory ],
            new ActionsPlantDiagramRenderFactory().create(),
            [],
            this.options
        );

        return generateService.generate(filesPattern);
    }

}

const options: GeneratorOptions = {
    baseDir: '../_sandbox_/ngrx-example-app/src',
    imageFormat: 'off',
    generateImages: false,
    ignorePattern: ['**/*.spec.ts'],
    tsConfigFileName: 'tsconfig.json',
    saveConvertResultToJson: true,
    saveWsd: false,
    logLevel: 'INFO'
};


// -f '**/*ts' -d  -i '**/*.spec.ts' -c tsconfig.app.json --js

const symbolService = new SymbolsService(options);


symbolService.generate('**/*.ts');

