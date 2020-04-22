
import log from 'loglevel';
import ts from 'typescript';

import { getCallExpressionName, syntaxKindText } from '../utils/tsutils';
import { ActionWithSymbol } from './models/action-with-symbol.model';
import { Action } from './models/action.model';
import {
    CallExpression, NamedType, Property, Type, TypeArgument, TypeLiteral, TypeReference
} from './models/type.model';

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

    function propertySignatureToProperty(property: ts.PropertySignature): Property {
        return {
            name: property.name.getText(sourceFile),
            type: property.type && property.type.getText(sourceFile)
        };
    }

    function convertTypeLiteral(arg: ts.TypeLiteralNode): TypeLiteral {
        const properties = arg.members.map((member) => {
            if (ts.isPropertySignature(member)) {
                return propertySignatureToProperty(member);
            }

            return;
        }).filter(p => !!p) as Property[];
        return new TypeLiteral(properties);
    }

    function extractTypeArguments(callExpression: ts.CallExpression): TypeArgument[] | undefined {

        const typeArguments = [];

        if (callExpression.typeArguments) {
            for (const typeArgument of callExpression.typeArguments) {
                if (ts.isTypeLiteralNode(typeArgument)) {
                    typeArguments.push(convertTypeLiteral(typeArgument));
                } else if (ts.isTypeReferenceNode(typeArgument)) {
                    typeArguments.push(new TypeReference(typeArgument.getText(sourceFile)));
                } else {
                    typeArguments.push(new NamedType(  syntaxKindText(typeArgument) ));
                }
            }
        }
        return typeArguments;
    }

    function extractCreateActionArgs(args: ts.Expression[]): Type[] | undefined {
        if (!args) {
            return;
        }
        const convertedArgs: Type[] = [];
        //  const convertedArgs = []
        for (const arg of args) {
            if (ts.isCallExpression(arg)) {
                const callExpressionName = getCallExpressionName(arg);
                convertedArgs.push(new CallExpression(callExpressionName, extractTypeArguments(arg)));
            } else {
                const name = ts.isIdentifier(arg) ? arg.text : undefined;
                convertedArgs.push(new NamedType(syntaxKindText(arg), name));
            }
        }
        return convertedArgs.length > 0 ? convertedArgs : undefined;
    }


    function getCreateActionInitializer(callExpression: ts.CallExpression): Action | undefined {
        if (isCreateAction(callExpression)) {
            const [nameArg, ...args] = callExpression.arguments;
            let action: Action;
            if (ts.isStringLiteral(nameArg)) {
                action = new Action(nameArg.text);
                action.createActionArgs = extractCreateActionArgs(args);
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
