/* eslint-disable @typescript-eslint/no-use-before-define */
import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

import { getFileName } from '../utils/utils';
import { ActionReference } from './models/action-reference.model';
import { Action } from './models/action.model';

export function findActionReferences(
    sourceFiles: readonly ts.SourceFile[],
    checker: ts.TypeChecker,
    actionsMap: Map<ts.Symbol, Action>
): ActionReference[] {

    const actionsReferences: ActionReference[] = [];

    for (const sourceFile of sourceFiles) {
        if (!sourceFile.isDeclarationFile) {
            ts.forEachChild(sourceFile, search);
        }
    }

    return actionsReferences;

    /********************************************
     * Internal
    **/

    function search(node: ts.Node): void {
        if (canBeActionReference(node)) {
            const symbol = checker.getSymbolAtLocation(node);
            if (symbol) {
                const action = actionsMap.get(symbol);
                if (action) {
                    log.debug(`FOUND ACTION: "${chalk.yellow(action.name)}" in ${node.getSourceFile().fileName}`);
                    log.debug('name:', node.getText());
                    actionsReferences.push(serializeActionUse(action, node, symbol));
                    return;
                }
            }
        }
        ts.forEachChild(node, search);
    }

    function canBeActionReference(node: ts.Node): boolean {
        return (ts.isIdentifier(node) || ts.isPropertyAccessExpression(node))
            && node.parent && !ts.isVariableDeclaration(node.parent);
    }

    function serializeSymbol(symbol: ts.Symbol): ActionReference {
        const reference = new ActionReference(symbol.getName());
        reference.documentation = ts.displayPartsToString(symbol.getDocumentationComment(checker));
        reference.type = checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration));
        return reference;
    }

    function serializeActionUse(action: Action, node: ts.Node, symbol: ts.Symbol): ActionReference {
        const reference = serializeSymbol(symbol);
        reference.isCall = isActionCall(node);
        reference.action = action;
        reference.filePath = node.getSourceFile().fileName;
        reference.fileName =  getFileName(reference.filePath);
            action.addReferece(reference);
        return reference;
    }

    function isActionCall(node: ts.Node): boolean {
        return node.parent && ts.isCallExpression(node.parent) && node.parent.expression === node;
    }
}
