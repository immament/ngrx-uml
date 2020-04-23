
import ts from 'typescript';

import { getCallExpressionName } from '../../../utils/tsutils';
import { Action } from '../../models/action.model';
import { ConvertedItem } from '../../models/convertet-item.model';
import { BaseType, CallExpression, TypeArgument } from '../../models/type.model';
import { ConvertContext } from '../convert.context';
import NodeConverter from './node.converter';

const createActionName = 'createAction';

export class CallExpressionConverter extends NodeConverter {

    convert(context: ConvertContext, node: ts.CallExpression): ConvertedItem | undefined {
        if (this.isCreateAction(node)) {
            const [nameArg, ...args] = node.arguments;
            let action: Action;
            if (ts.isStringLiteral(nameArg)) {
                action = new Action(nameArg.text);
                action.createActionArgs = this.extractCreateActionArgs(context, args);
                return action;
            }
        } else {
            const callExpressionName = getCallExpressionName(node);
            return new CallExpression(callExpressionName, this.extractTypeArguments(context, node));
        }
        return;
    }

    private isCreateAction(callExpression: ts.CallExpression): boolean {
        return getCallExpressionName(callExpression) === createActionName;
    }


    private extractTypeArguments(context: ConvertContext, callExpression: ts.CallExpression): TypeArgument[] | undefined {

        const typeArguments = [];

        if (callExpression.typeArguments) {
            for (const typeArgument of callExpression.typeArguments) {

                const convertedTypeArgument  = context.converter.convertNode(context, typeArgument, true);
                if(convertedTypeArgument instanceof TypeArgument) {
                    typeArguments.push(convertedTypeArgument);
                }
            }
        }
        return typeArguments;
    }

    extractCreateActionArgs(context: ConvertContext, args: ts.Expression[]): BaseType[] | undefined {
        if (!args) {
            return;
        }
        const convertedArgs: BaseType[] = [];

        for (const arg of args) {
            const convertedArg = context.converter.convertNode(context, arg, true);
            if(convertedArg instanceof BaseType) {
                convertedArgs.push(convertedArg);
            }
        }
        return convertedArgs.length > 0 ? convertedArgs : undefined;
    }
}