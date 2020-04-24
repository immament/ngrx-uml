import chalk from 'chalk';
import log from 'loglevel';
import path from 'path';
import ts from 'typescript';

import { ActionReference } from '../../actions/models/action-reference.model';
import { Action } from '../../actions/models/action.model';
import { ConvertContext } from '../../converters/convert.context';
import NodeConverter from '../../converters/models/node.converter';
import { getFileName } from '../../utils/utils';
import { ActionReferenceConvertContext } from '../action-reference-convert.context';

export class ActionReferenceConverter extends NodeConverter {

    convert(context: ActionReferenceConvertContext, node: ts.VariableDeclaration): boolean | undefined {

        if (!node.parent || ts.isVariableDeclaration(node.parent)) {
            return;
        }

        const symbol = context.typeChecker.getSymbolAtLocation(node);
        if (symbol) {
            const action = context.actionsMap.get(symbol);
            if (action) {
                const fileName = path.basename(node.getSourceFile().fileName );
                log.trace(`Found Action: "${chalk.yellow(action.name)}" in ${fileName}`);
                log.trace('name:', node.getText());
                context.addResult(this.serializeActionUse(context, action, node, symbol));
                return true;
            }
        }

    }


    private serializeSymbol(context: ConvertContext, symbol: ts.Symbol): ActionReference {
        const reference = new ActionReference(symbol.getName());
        reference.documentation = ts.displayPartsToString(symbol.getDocumentationComment(context.typeChecker));
        reference.type = context.typeChecker.typeToString(context.typeChecker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration));
        return reference;
    }

    private serializeActionUse(context: ConvertContext, action: Action, node: ts.Node, symbol: ts.Symbol): ActionReference {
        const reference = this.serializeSymbol(context, symbol);
        reference.isCall = this.isActionCall(node);
        reference.action = action;
        reference.filePath = node.getSourceFile().fileName;
        reference.fileName =  getFileName(reference.filePath);
            action.addReferece(reference);
        return reference;
    }

    private isActionCall(node: ts.Node): boolean {
        return node.parent && ts.isCallExpression(node.parent) && node.parent.expression === node;
    }


}