import chalk from 'chalk';
import log from 'loglevel';
import { Program, SyntaxKind, TypeChecker } from 'typescript';

import { ConvertContext, ConvertContextFactory, Converter } from '../../../core/converters';
import { TypeKind } from '../../../core/converters/models';

import { LabItemConvertContext } from './lab-item-convert.context';
import { LabSourceFileConverter } from './node-converters/lab-source-file.converter';
import { LabConverter } from './node-converters/lab.converter';

export class LabConvertContextFactory implements ConvertContextFactory {

    create(program: Program, typeChecker: TypeChecker, converter: Converter, _lastContext?: ConvertContext): ConvertContext {

        this.configureConverter(converter);

        // devLogger.info('program.getResolvedProjectReferences', 
        // program.getRootFileNames());

        return new LabItemConvertContext(
            'Lab',
            program,
            typeChecker,
            converter,
            [TypeKind.Unknown],
            undefined,
            this.onFinish
        );
    }

    configureConverter(converter: Converter): void {
        converter.registerConverters({
            [SyntaxKind.CallExpression]: [new LabConverter],
            [SyntaxKind.SourceFile]: [new LabSourceFileConverter],
        }, {});
        // TODO: temporary filter
        // converter.nodeFilter = (node: ts.Node): boolean => !node.getSourceFile().fileName.includes('/ngrx/modules/');
        // node.getSourceFile().fileName.includes('books.module.ts');         
    }


    private onFinish(context: LabItemConvertContext): void {

        const result = context.getRawResult();
        if (!result.size) {
            log.info(chalk.yellow(`Nothing found in context: ${context.name}`));
        }

        for (const [kind, map] of result.entries()) {
            log.info(`Found: ${map.size} ${TypeKind[kind]}s`);
        }

    }
}
