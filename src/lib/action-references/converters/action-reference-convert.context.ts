import ts from 'typescript';

import { Action } from '../../actions/models/action.model';
import { ConvertContext, ConvertContextFactory } from '../../converters/convert.context';
import { Converter } from '../../converters/converter';
import { ConvertedItem, TypeKind } from '../../converters/models/type.model';
import { getKeyReplacer } from '../../utils';
import { ActionReference } from '../models/action-reference.model';

import { ActionReferenceConverter } from './node-converters/action-reference.converter';

export class ActionReferenceConvertContext implements ConvertContext {

    name = 'action-references';
    result: ActionReference[] = [];
    actionsMap: Map<ts.Symbol, Action>;

    constructor(
        public program: ts.Program,
        public typeChecker: ts.TypeChecker,
        public converter: Converter,
        lastContext: ConvertContext
    ) {
        this.actionsMap =  lastContext.getRawResult() as Map<ts.Symbol, Action>;
    }

    getRawResult(): unknown {
        return this.result;
    }
    getResult(): ConvertedItem[] | undefined {
        return [...this.actionsMap.values()];
    }

    addResult(actionReference: ActionReference): void {
        this.result.push(actionReference);
    }

    serializeResultToJson(): string | undefined {
        const result = this.getResult();
        if(result) { 
            return JSON.stringify(result, getKeyReplacer('action'), 2);
        }
    }


}

export class ActionReferenceConvertContextFactory implements ConvertContextFactory {


    create(program: ts.Program, typeChecker: ts.TypeChecker, converter: Converter, lastContext: ConvertContext): ConvertContext {
        this.configureConverter(converter);
        return new ActionReferenceConvertContext(program, typeChecker, converter,  lastContext);

    }

    configureConverter(converter: Converter): void {
        const actionReferenceConverter = new ActionReferenceConverter();

        converter.registerConverters({
            [TypeKind.Identifier]: actionReferenceConverter,
            [TypeKind.PropertyAccessExpression]: actionReferenceConverter,
        }, { replace: true });

        converter.nodeFilter = undefined;

    }

}