import ts from 'typescript';

import { Action } from '../../actions/models/action.model';
import { ContextFactory, ConvertContext } from '../../converters/convert.context';
import { Converter } from '../../converters/converter';
import { TypeKind } from '../../converters/models/type.model';
import { ActionReference } from '../models/action-reference.model';

import { ActionReferenceConverter } from './node-converters/action-reference.converter';

export class ActionReferenceConvertContext implements ConvertContext {


    result: ActionReference[] = [];


    constructor(
        public program: ts.Program,
        public typeChecker: ts.TypeChecker,
        public converter: Converter,
        public actionsMap: Map<ts.Symbol, Action>
    ) {
    }

    addResult(actionReference: ActionReference): void {
        this.result.push(actionReference);
    }

}

export class ActionReferenceConvertContextFactory implements ContextFactory {

    constructor(private actionsMap: Map<ts.Symbol, Action>) { }

    create(program: ts.Program, typeChecker: ts.TypeChecker, converter: Converter): ConvertContext {
        return new ActionReferenceConvertContext(program, typeChecker, converter, this.actionsMap);
    }

    configureConverter(converter: Converter): void {
        const actionReferenceConverter = new ActionReferenceConverter();
        converter.registerConverters({
            [TypeKind.Identifier]: actionReferenceConverter,
            [TypeKind.PropertyAccessExpression]: actionReferenceConverter,
        } , {replace: true});

        converter.nodeFilter = undefined;

    }

}