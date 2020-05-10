
import ts from 'typescript';

import { ConvertContext } from '../../../converters/convert.context';
import { NodeConverter } from '../../../converters/models/node.converter';
import { CallExpression, ConvertedItem, TypeArgument } from '../../../converters/models/type.model';
import { getCallExpressionName } from '../../../utils/tsutils';

export class CallExpressionConverter extends NodeConverter {

    convert(context: ConvertContext, node: ts.CallExpression): ConvertedItem | undefined {

        const callExpressionName = getCallExpressionName(node);
        return new CallExpression(callExpressionName, this.extractTypeArguments(context, node));
    }


    private extractTypeArguments(context: ConvertContext, callExpression: ts.CallExpression): TypeArgument[] | undefined {

        const typeArguments = [];

        if (callExpression.typeArguments) {
            for (const typeArgument of callExpression.typeArguments) {

                const convertedTypeArgument = context.converter.convertNode(context, typeArgument, true);
                if (convertedTypeArgument instanceof TypeArgument) {
                    typeArguments.push(convertedTypeArgument);
                }
            }
        }
        return typeArguments;
    }

}