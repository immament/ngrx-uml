import ts from 'typescript';

import { ConvertContext, ConvertContextFactory } from '../../converters/convert.context';
import { Converter } from '../../converters/converter';
import { TypeKind } from '../../converters/models/type.model';

import { ActionConvertContext } from './action-convert.context';
import { CallExpressionConverter } from './node-converters/call-expression.converter';
import { CreateActionCallExpConverter } from './node-converters/create-action-call-exp.converter';
import { CreateReducerCallExpConverter } from './node-converters/create-reducer-call-exp.converter';
import { TypeLiteralConverter } from './node-converters/type-literal.converter';
import { TypeReferenceConverter } from './node-converters/type-reference.converter';
import { VariableDeclarationConverter } from './node-converters/variable-declaration.converter';

export class ActionConvertContextFactory implements ConvertContextFactory {

    create(program: ts.Program, typeChecker: ts.TypeChecker, converter: Converter, _lastContext?: ConvertContext): ConvertContext {
        this.configureConverter(converter);
        return new ActionConvertContext(
            'actions',
            program,
            typeChecker,
            converter,
            [TypeKind.Action, TypeKind.Reducer]
        );
    }

    configureConverter(converter: Converter): void {
        converter.registerConverters({
            [TypeKind.VariableDeclaration]: [new VariableDeclarationConverter],
            [TypeKind.CallExpression]: [new CreateActionCallExpConverter, new CreateReducerCallExpConverter, new CallExpressionConverter],
            [TypeKind.TypeLiteral]: [new TypeLiteralConverter],
            [TypeKind.TypeReference]: [new TypeReferenceConverter]
        }, {});
        converter.nodeFilter = (node: ts.Node): boolean => ts.isVariableDeclaration(node);
    }
}