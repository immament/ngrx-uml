import log from 'loglevel';
import ts from 'typescript';

import { CallExpressionConverter } from './converters/call-expression.converter';
import { DefaultConverter } from './converters/default.converter';
import NodeConverter from './converters/node.converter';
import { TypeLiteralConverter } from './converters/type-literal.converter';
import { TypeReferenceConverter } from './converters/type-referenceconverter';
import { VariableDeclarationConverter } from './converters/variable-declaration.converter';
import { ActionWithSymbol } from './models/action-with-symbol.model';
import { ConvertedItem } from './models/convertet-item.model';
import { TypeKind } from './models/type.model';

export class ConvertContext {
    actions: ActionWithSymbol[] = [];

    private converters: { [kind: number]: NodeConverter } = {};

    private defaultConverter = new DefaultConverter();

    constructor(
        public program: ts.Program,
        public typeChecker: ts.TypeChecker,
    ) {
        this.registerConverters();
    }



    registerConverters(): void {
        this.converters = {
            [TypeKind.VariableDeclaration]: new VariableDeclarationConverter,
            [TypeKind.CallExpression]: new CallExpressionConverter,
            [TypeKind.TypeLiteral]: new TypeLiteralConverter,
            [TypeKind.TypeReference]: new TypeReferenceConverter
        };
    }

    convertNode(node: ts.Node, withDefault = false): ConvertedItem | undefined {

        if (this.converters[node.kind]) {
            return this.converters[node.kind].convert(this, node);
        } else if (withDefault){
            return new DefaultConverter().convert(this, node);
        }
    }

}