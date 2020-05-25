
import chalk from 'chalk';
import log from 'loglevel';
import { Program, SyntaxKind, TypeChecker } from 'typescript';

import { ConvertContext, ConvertContextFactory } from '../../core/converters/convert.context';
import { Converter } from '../../core/converters/converter';
import { TypeKind } from '../../core/converters/models/type-kind.enum';
import { ItemConvertContext } from '../../impl/converters/item-convert.context';

import { NgModuleConverter } from './node-converters/ng-module.converter';

export class SandboxConvertContextFactory implements ConvertContextFactory {

    create(program: Program, typeChecker: TypeChecker, converter: Converter, _lastContext?: ConvertContext): ConvertContext {
        this.configureConverter(converter);
        return new ItemConvertContext(
            'sandbox',
            program,
            typeChecker,
            converter,
            [TypeKind.Action, TypeKind.Reducer, TypeKind.NgModule],
            undefined,
            this.onFinish
        );
    }

    configureConverter(converter: Converter): void {
        converter.registerConverters({
            [SyntaxKind.ClassDeclaration]: [new NgModuleConverter],
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
