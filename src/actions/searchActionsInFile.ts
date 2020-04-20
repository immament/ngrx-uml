
import log from 'loglevel';
import ts from 'typescript';

import { getCallExpressionName } from '../utils/tsutils';
import { ActionWithSymbol } from './models/action-with-symbol.model';
import { Action } from './models/action.model';
import { Props } from './models/props.model';

export function searchActionsInFile(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker): ActionWithSymbol[] {
    const actions: ActionWithSymbol[] = [];

    function main(): ActionWithSymbol[] {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        sourceFile.forEachChild(searchActionsInNode);
        return actions;
    }

    return main();

    function isCreateAction(callExpression: ts.CallExpression): boolean {
        return getCallExpressionName(callExpression) === 'createAction';
    }

    function propertySignatureToProps(property: ts.PropertySignature): Props {

        return {
            name: property.name.getText(sourceFile),
            type: property.type && property.type.getText(sourceFile)
        } as Props;
    }

    function getPropsMembers(arg: ts.TypeLiteralNode): Props[] {
        const props = arg.members.map((member) => {
            if (ts.isPropertySignature(member)) {
                return propertySignatureToProps(member);
            }
            return;
        }).filter(p => !!p) as Props[];
        return props;
    }

    function extractProps(callExpression: ts.CallExpression): Props[] | undefined {
        if (getCallExpressionName(callExpression) !== 'props') {
            return;
        }
        const props = [];
        if (callExpression.typeArguments) {
            for (const typeArgument of callExpression.typeArguments) {
                if (ts.isTypeLiteralNode(typeArgument)) {
                    props.push(...getPropsMembers(typeArgument));
                }
            }
        }
        return props;
    }

    function extractCreateActionProps(args: ts.Expression[]): Props[] | undefined {
        if (!args) {
            return;
        }
        for (const arg of args) {
            if (ts.isCallExpression(arg)) {
                if (getCallExpressionName(arg) === 'props') {
                    return extractProps(arg);
                }
            }
        }
        return;
    }


    function getCreateActionInitializer(callExpression: ts.CallExpression): Action | undefined {
        if (isCreateAction(callExpression)) {
            const [nameArg, ...args] = callExpression.arguments;
            let action: Action;
            if (ts.isStringLiteral(nameArg)) {
                action = new Action(nameArg.text);
                action.props = extractCreateActionProps(args);
                return action;
            }
        }
        return;
    }

    function checkIfVariableStatementIsAction(declaration: ts.VariableDeclaration): void {
        const initializer = declaration.initializer;
        if (!initializer || !ts.isCallExpression(initializer)) {
            return;
        }
        const action = getCreateActionInitializer(initializer);
        if (action) {
            const symbol = typeChecker.getSymbolAtLocation(declaration.name);
            if (symbol) {
                action.variable = declaration.name.getText(sourceFile);
                action.filePath = sourceFile.fileName;
                log.trace('create action', action);
                actions.push({
                    action,
                    symbol
                } as ActionWithSymbol);
            }
        }
    }

    function searchActionsInNode(node: ts.Node): void {
        log.trace('searchActionsInNode', node);
        switch (node.kind) {
            case ts.SyntaxKind.VariableDeclaration: {
                checkIfVariableStatementIsAction(node as ts.VariableDeclaration);
                break;
            }
        }
        node.forEachChild(child => {
            searchActionsInNode(child);
        });
    }

}
