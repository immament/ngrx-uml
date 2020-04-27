import ts from 'typescript';

import { ConvertContext, ConvertContextFactory } from '../../converters/convert.context';
import { Converter } from '../../converters/converter';
import { ConvertedItem, TypeKind } from '../../converters/models/type.model';
import { getKeyReplacer } from '../../utils';
import { ActionWithSymbol } from '../models/action-with-symbol.model';
import { Action } from '../models/action.model';

import { CallExpressionConverter } from './node-converters/call-expression.converter';
import { TypeLiteralConverter } from './node-converters/type-literal.converter';
import { TypeReferenceConverter } from './node-converters/type-reference.converter';
import { VariableDeclarationConverter } from './node-converters/variable-declaration.converter';

export class ActionConvertContext implements ConvertContext {

    name = 'actions';
    result = new Map<ts.Symbol, Action>();

    constructor(
        public program: ts.Program,
        public typeChecker: ts.TypeChecker,
        public converter: Converter,
        _lastContext?: ConvertContext
    ) {
    }

    getRawResult(): unknown {
        return this.result;
    }

    getResult(): ConvertedItem[] | undefined {
        return [...this.result.values()];
    }

    addResult(actionWithSymbol: ActionWithSymbol): void {
        this.result.set(actionWithSymbol.symbol, actionWithSymbol.action);
    }

    serializeResultToJson(): string | undefined {
        const result = this.getResult();
        if(result) { 
            return JSON.stringify(result, getKeyReplacer('action'), 2);
        }
    }
}

export class ActionConvertContextFactory implements ConvertContextFactory {
    create(program: ts.Program, typeChecker: ts.TypeChecker, converter: Converter, lastContext?: ConvertContext): ConvertContext {
        this.configureConverter(converter);
        return new ActionConvertContext(program, typeChecker, converter, lastContext);
    }

    configureConverter(converter: Converter): void {
        converter.registerConverters({
            [TypeKind.VariableDeclaration]: new VariableDeclarationConverter,
            [TypeKind.CallExpression]: new CallExpressionConverter,
            [TypeKind.TypeLiteral]: new TypeLiteralConverter,
            [TypeKind.TypeReference]: new TypeReferenceConverter
        }, {});

        converter.nodeFilter = (node: ts.Node): boolean => ts.isVariableDeclaration(node);

    }

}