import log from 'loglevel';
import ts from 'typescript';

import { ConvertContext } from '../convert-context';
import { ActionWithSymbol } from '../models/action-with-symbol.model';
import { Action } from '../models/action.model';
import NodeConverter from './node.converter';

export class VariableDeclarationConverter extends NodeConverter {

    convert(context: ConvertContext, node: ts.VariableDeclaration): Action | undefined {
        const sourceFile = node.getSourceFile();
        const initializer = node.initializer;
        if (!initializer || !ts.isCallExpression(initializer)) {
            return;
        }

        const action = context.convertNode(initializer);

        if (action instanceof Action) {
            const symbol = context.typeChecker.getSymbolAtLocation(node.name);
            if (symbol) {
                action.variable = node.name.getText(sourceFile);
                action.filePath = sourceFile.fileName;
                log.trace('create action', action);
                context.actions.push({
                    action,
                    symbol
                } as ActionWithSymbol);
            }
            return action;
        }
       
    }



}