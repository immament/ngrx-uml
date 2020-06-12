
import ts from 'typescript';

import { ConvertContext } from '../../../core/converters/convert.context';
import {
    CallExpression
} from '../../../core/converters/models/converted-items/call-expression.model';
import {
    ConvertedItem
} from '../../../core/converters/models/converted-items/converted-item.model';
import { TypeArgument } from '../../../core/converters/models/converted-items/type-argument.model';
import { NodeConverter } from '../../../core/converters/node.converter';
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