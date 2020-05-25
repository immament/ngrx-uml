

import ts, { Program, TypeChecker } from 'typescript';

import { ConvertContext, ConvertContextFactory } from '../../core/converters/convert.context';
import { Converter } from '../../core/converters/converter';
import { TypeKind } from '../../core/converters/models/type-kind.enum';

import { ItemConvertContext } from './item-convert.context';
import { CallExpressionConverter } from './node-converters/call-expression.converter';
import { CreateActionCallExpConverter } from './node-converters/create-action-call-exp.converter';
import { CreateReducerCallExpConverter } from './node-converters/create-reducer-call-exp.converter';
import { TypeLiteralConverter } from './node-converters/type-literal.converter';
import { TypeReferenceConverter } from './node-converters/type-reference.converter';
import { VariableDeclarationConverter } from './node-converters/variable-declaration.converter';

export class ActionConvertContextFactory implements ConvertContextFactory {

    create(program: Program, typeChecker: TypeChecker, converter: Converter, _lastContext?: ConvertContext): ConvertContext {
        this.configureConverter(converter);
        return new ItemConvertContext(
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
