import { Program, TypeChecker } from 'typescript';

import { ActionConvertContext } from '../../actions/converters';
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
            lastContext);
    }

    configureConverter(converter: Converter): void {
        const actionReferenceConverter = new ActionReferenceConverter();
        converter.registerConverters({
            [TypeKind.Identifier]: [actionReferenceConverter],
            [TypeKind.PropertyAccessExpression]: [actionReferenceConverter],
        }, { replace: true });
        converter.nodeFilter = undefined;
    }
}
