import chalk from 'chalk';
import log from 'loglevel';
import path from 'path';
import ts from 'typescript';

import { Action } from '../../../actions/models/action.model';
import { ConvertContext } from '../../../converters/convert.context';
import NodeConverter from '../../../converters/models/node.converter';
import { ConvertedItem } from '../../../converters/models/type.model';
import { syntaxKindText } from '../../../utils/tsutils';
import { getFileName } from '../../../utils/utils';
import { ActionReference, Declaration } from '../../models/action-reference.model';
import { ActionReferenceConvertContext } from '../action-reference-convert.context';

export class ActionReferenceConverter extends NodeConverter {

    convert(context: ActionReferenceConvertContext, node: ts.VariableDeclaration): ConvertedItem | undefined {

        if (!node.parent || ts.isVariableDeclaration(node.parent)) {
            return;
        }

        const symbol = context.typeChecker.getSymbolAtLocation(node);
        if (symbol) {
            const action = context.actionsMap.get(symbol);
            if (action) {
                const fileName = path.basename(node.getSourceFile().fileName);
                log.trace(`Found Action: "${chalk.yellow(action.name)}" in ${chalk.cyan(fileName)}`);
                log.trace('name:', node.getText());

                const reference = this.serializeActionUse(context, action, node, symbol);
                context.addResult(reference);

                return reference;
            }
        }

    }

    private declarationContext(node: ts.Node): Declaration[] {

        const context: Declaration[] = [];
        let currentNode: ts.Node = node;
        while (currentNode) {
            switch (currentNode.kind) {
                case ts.SyntaxKind.ClassDeclaration:
                case ts.SyntaxKind.PropertyDeclaration:
                case ts.SyntaxKind.VariableDeclaration:
                case ts.SyntaxKind.FunctionDeclaration:
                case ts.SyntaxKind.MethodDeclaration: {
                    const declaration = currentNode as ts.NamedDeclaration;
                    context.push({ kindText: syntaxKindText(currentNode), name: declaration.name?.getText() });
                    break;
                }
            }
            currentNode = currentNode.parent;

        }
        return context.reverse();

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
        reference.fileName = getFileName(reference.filePath);

        reference.declarationContext = this.declarationContext(node);

        action.addReference(reference);

        return reference;
    }

    private isActionCall(node: ts.Node): boolean {
        return node.parent && ts.isCallExpression(node.parent) && node.parent.expression === node;
    }


}