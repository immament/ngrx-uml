import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

import NodeConverter from '../../../converters/models/node.converter';
import { ActionWithSymbol } from '../../models/action-with-symbol.model';
import { Action } from '../../models/action.model';
import { ActionConvertContext } from '../action-convert.context';

export class VariableDeclarationConverter extends NodeConverter {

    convert(context: ActionConvertContext, node: ts.VariableDeclaration): Action | undefined {
        const sourceFile = node.getSourceFile();
        const initializer = node.initializer;
        if (!initializer || !ts.isCallExpression(initializer)) {
            return;
        }

        const action = context.converter.convertNode(context, initializer);

        if (action instanceof Action) {
            const symbol = context.typeChecker.getSymbolAtLocation(node.name);
            if (symbol) {
                action.variable = node.name.getText(sourceFile);
                action.filePath = sourceFile.fileName;
                log.debug(`Found action  ${chalk.yellow(action.name)} in ${chalk.gray(action.filePath)}`);
                context.addResult( { symbol, action } as ActionWithSymbol);
                
            }
            return action;
        }
       
    }



}