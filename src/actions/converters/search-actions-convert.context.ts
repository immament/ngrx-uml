import ts from 'typescript';

import { ActionWithSymbol } from '../models/action-with-symbol.model';
import { Action } from '../models/action.model';
import { TypeKind } from '../models/type.model';
import { ContextFactory, ConvertContext } from './convert.context';
import { Converter } from './converter';
import { CallExpressionConverter } from './node-converters/call-expression.converter';
import { TypeLiteralConverter } from './node-converters/type-literal.converter';
import { TypeReferenceConverter } from './node-converters/type-referenceconverter';
import { VariableDeclarationConverter } from './node-converters/variable-declaration.converter';

export class SearchActionsConvertContext implements ConvertContext {


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

export class SearchActionsConvertContextFactory implements ContextFactory {
    create(program: ts.Program, typeChecker: ts.TypeChecker, converter: Converter): ConvertContext {
        return new SearchActionsConvertContext(program, typeChecker, converter);
    }

    configureConverter(converter: Converter): void {
        converter.registerConverters({
            [TypeKind.VariableDeclaration]: new VariableDeclarationConverter,
            [TypeKind.CallExpression]: new CallExpressionConverter,
            [TypeKind.TypeLiteral]: new TypeLiteralConverter,
            [TypeKind.TypeReference]: new TypeReferenceConverter
        });

        converter.nodeFilter = (node: ts.Node): boolean => ts.isVariableDeclaration(node);

    }

}