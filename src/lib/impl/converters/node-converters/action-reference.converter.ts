import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

import { ConvertContext } from '../../../core/converters/convert.context';
import { TypeKind } from '../../../core/converters/models';
import { NodeConverter } from '../../../core/converters/node.converter';
import { syntaxKindText } from '../../../utils/tsutils';
import { getFileName } from '../../../utils/utils';
import { ActionReference, Declaration } from '../../models/action-reference.model';
import { Action } from '../../models/action.model';
import { Reducer } from '../../models/reducer.model';
import { ItemConvertContext } from '../item-convert.context';

export class ActionReferenceConverter extends NodeConverter {

    convert(context: ItemConvertContext, node: ts.VariableDeclaration): ActionReference | undefined {

        if (!node.parent || ts.isVariableDeclaration(node.parent)) {
            return;
        }

        const symbol = context.typeChecker.getSymbolAtLocation(node);
        if (symbol) {
            const action = context.getItem<Action>(TypeKind.Action, symbol);
            if (action) {
                // const fileName = path.basename(node.getSourceFile().fileName);
                log.debug(`Found Action use: "${chalk.yellow(action.name)}" in ${chalk.gray(node.getSourceFile().fileName)}`);
                log.trace('name:', node.getText());

                const reference = this.serializeActionUse(context, action, node, symbol);
                // context.addResult(reference);

                return reference;
            }
        }
        return;

    }

    private declarationContext(context: ItemConvertContext, action: Action, node: ts.Node): Declaration[] {

        const contextStack: Declaration[] = [];
        let currentNode: ts.Node = node;
        while (currentNode) {
            if (ts.isVariableDeclaration(currentNode)) {
                const symbol = context.typeChecker.getSymbolAtLocation(currentNode.name);
                if (symbol) {
                    const reducer = context.getItem<Reducer>(TypeKind.Reducer, symbol);
                    if (reducer) {
                        reducer.addAction(action);
                    }
                }
            }

            switch (currentNode.kind) {
                case ts.SyntaxKind.ClassDeclaration:
                case ts.SyntaxKind.PropertyDeclaration:
                case ts.SyntaxKind.VariableDeclaration:
                case ts.SyntaxKind.FunctionDeclaration:
                case ts.SyntaxKind.MethodDeclaration: {
                    const declaration = currentNode as ts.NamedDeclaration;
                    contextStack.push({ kindText: syntaxKindText(currentNode), name: declaration.name?.getText() });
                    break;
                }
            }
            currentNode = currentNode.parent;

        }
        return contextStack.reverse();

    }


    private serializeSymbol(context: ConvertContext, symbol: ts.Symbol): ActionReference {
        const reference = new ActionReference(symbol.getName());
        reference.documentation = ts.displayPartsToString(symbol.getDocumentationComment(context.typeChecker));
        reference.type = context.typeChecker.typeToString(context.typeChecker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration));
        return reference;
    }

    private serializeActionUse(context: ItemConvertContext, action: Action, node: ts.Node, symbol: ts.Symbol): ActionReference {
        const reference = this.serializeSymbol(context, symbol);
        reference.isCall = this.isActionCall(node);
        reference.action = action;
        reference.filePath = node.getSourceFile().fileName;
        reference.fileName = getFileName(reference.filePath);

        reference.declarationContext = this.declarationContext(context, action, node);

        action.addReference(reference);

        return reference;
    }

    private isActionCall(node: ts.Node): boolean {
        return node.parent && ts.isCallExpression(node.parent) && node.parent.expression === node;
    }
}