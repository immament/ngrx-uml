
import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

import { ConvertContext } from '../../../core/converters/convert.context';
import {
    ConvertedItem
} from '../../../core/converters/models/converted-items/converted-item.model';
import { NodeConverter } from '../../../core/converters/node.converter';
import { getCallExpressionName } from '../../../utils/tsutils';
import { Action } from '../../models/action.model';

const createActionName = 'createAction';

export class CreateActionCallExpConverter extends NodeConverter {

    convert(context: ConvertContext, node: ts.CallExpression): Action | undefined {
        if (this.isCreateAction(node)) {
            const [nameArg, ...args] = node.arguments;
            let action: Action;
            if (ts.isStringLiteral(nameArg)) {
                action = new Action(nameArg.text);
                action.createActionArgs = this.extractCreateActionArgs(context, args);
                action.filePath = node.getSourceFile().fileName;
                log.debug(`Found ${action.kindText}: ${chalk.yellow(action.name)} in ${chalk.gray(action.filePath)}`);
                return action;
            }
        } 
        return;
    }

    private isCreateAction(callExpression: ts.CallExpression): boolean {
        return getCallExpressionName(callExpression) === createActionName;
    }

    private extractCreateActionArgs(context: ConvertContext, args: ts.Expression[]): ConvertedItem[] | undefined {
        if (!args) {
            return;
        }
        const convertedArgs: ConvertedItem[] = [];

        for (const arg of args) {
            const convertedArg = context.converter.convertNode(context, arg, true);
            if(convertedArg) {
                convertedArgs.push(convertedArg);
            }
        }
        return convertedArgs.length > 0 ? convertedArgs : undefined;
    }
}