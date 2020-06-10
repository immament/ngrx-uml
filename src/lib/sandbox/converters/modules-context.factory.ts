
import chalk from 'chalk';
import log from 'loglevel';
import { Program, SyntaxKind, TypeChecker } from 'typescript';

import { ConvertContext, ConvertContextFactory } from '../../core/converters/convert.context';
import { Converter } from '../../core/converters/converter';
import { TypeKind } from '../../core/converters/models/type-kind.enum';
import { ItemConvertContext } from '../../impl/converters/item-convert.context';

import { NgModuleConverter } from './node-converters/ng-module.converter';

export class ModulesConvertContextFactory implements ConvertContextFactory {

    create(program: Program, typeChecker: TypeChecker, converter: Converter, _lastContext?: ConvertContext): ConvertContext {
        this.configureConverter(converter);
        return new ItemConvertContext(
            'Modules',
            program,
            typeChecker,
            converter,
            [TypeKind.Action, TypeKind.Reducer, TypeKind.NgModule, TypeKind.RegisteredReducer],
            undefined,
            this.onFinish
        );
    }

    configureConverter(converter: Converter): void {
        converter.registerConverters({
            [SyntaxKind.ClassDeclaration]: [new NgModuleConverter],
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
