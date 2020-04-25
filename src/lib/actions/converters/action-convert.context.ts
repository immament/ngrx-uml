import ts from 'typescript';

import { ContextFactory, ConvertContext } from '../../converters/convert.context';
import { Converter } from '../../converters/converter';
import { TypeKind } from '../../converters/models/type.model';
import { ActionWithSymbol } from '../models/action-with-symbol.model';
import { Action } from '../models/action.model';

import { CallExpressionConverter } from './node-converters/call-expression.converter';
import { TypeLiteralConverter } from './node-converters/type-literal.converter';
import { TypeReferenceConverter } from './node-converters/type-reference.converter';
import { VariableDeclarationConverter } from './node-converters/variable-declaration.converter';

export class ActionConvertContext implements ConvertContext {

    result = new Map<ts.Symbol, Action>();

    constructor(
        public program: ts.Program,
        public typeChecker: ts.TypeChecker,
        public converter: Converter
    ) {
    }

    addResult(actionWithSymbol: ActionWithSymbol): void {
        this.result.set(actionWithSymbol.symbol, actionWithSymbol.action);
    }

}

export class ActionConvertContextFactory implements ContextFactory {
    create(program: ts.Program, typeChecker: ts.TypeChecker, converter: Converter): ConvertContext {
        return new ActionConvertContext(program, typeChecker, converter);
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