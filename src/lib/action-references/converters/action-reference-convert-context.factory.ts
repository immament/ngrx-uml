import chalk from 'chalk';
import log from 'loglevel';
import { Program, TypeChecker } from 'typescript';

import { ActionConvertContext } from '../../actions/converters';
import { Action } from '../../actions/models';
import { ConvertContext, ConvertContextFactory } from '../../converters/convert.context';
import { Converter } from '../../converters/converter';
import { TypeKind } from '../../converters/models/type.model';

import { ActionReferenceConverter } from './node-converters/action-reference.converter';

export class ActionReferenceConvertContextFactory implements ConvertContextFactory {

    create(program: Program, typeChecker: TypeChecker, converter: Converter, lastContext: ConvertContext): ConvertContext {
        this.configureConverter(converter);
        return new ActionConvertContext(
            'action-references',
            program,
            typeChecker,
            converter,
            [TypeKind.ActionReference],
            lastContext,
            this.onFinish
        );
    }

    configureConverter(converter: Converter): void {
        const actionReferenceConverter = new ActionReferenceConverter();
        converter.registerConverters({
            [TypeKind.Identifier]: [actionReferenceConverter],
            [TypeKind.PropertyAccessExpression]: [actionReferenceConverter],
        }, { replace: true });
        converter.nodeFilter = undefined;
    }

    onFinish(context: ActionConvertContext): void {
        const result = context.getRawResult();

        // for (const [kind, map] of result.entries()) {
        //     log.info(`Found: ${map.size} ${TypeKind[kind]}s`);
        // }

        const actionsMap = result.get(TypeKind.Action);
        if (actionsMap) {
            const hasReferences = ([...actionsMap.values()] as Action[]).some((a: Action) => a.getChildren().length > 0);
            if (!hasReferences) {
                log.warn(
                    chalk.magenta('Did not find action\'s references. Check if correct ts-config file is specified!')
                );
            }
        }

    }
}
