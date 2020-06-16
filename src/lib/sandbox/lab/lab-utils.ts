import chalk from 'chalk';
import log from 'loglevel';
import { EOL } from 'os';
import ts from 'typescript';

import { ConvertContext } from '../../core/converters/convert.context';
import devLogger, { logColor } from '../../utils/logger';
import { printNode } from '../../utils/preparet-to-print';
import { syntaxKindText } from '../../utils/tsutils';

export interface SearchedItem {
    item?: unknown;
    symbol?: ts.Symbol;
}

function getValue<T extends string | number | boolean>(typeChecker: ts.TypeChecker, exp: ts.Node): T | undefined {
    switch (exp.kind) {
        case ts.SyntaxKind.PropertyAccessExpression: {
            const propertyExp = exp as ts.PropertyAccessExpression;

            const symbol = typeChecker.getSymbolAtLocation(propertyExp);
            if (symbol) {
                return getValue<T>(typeChecker, symbol.valueDeclaration as ts.Node);
            } else {
                log.warn('no symbol for PropertyAccessExpression');
            }
        }
            return;

        case ts.SyntaxKind.ShorthandPropertyAssignment: {
            const assigment = exp as ts.ShorthandPropertyAssignment;
            if (assigment.objectAssignmentInitializer) {
                return getValue<T>(typeChecker, assigment.objectAssignmentInitializer);
            }
            return;
        }


        case ts.SyntaxKind.VariableDeclaration: {
            const declaration = exp as ts.VariableDeclaration;
            if (declaration.initializer) {
                return getValue<T>(typeChecker, declaration.initializer);
            }
            return;
        }
        case ts.SyntaxKind.StringLiteral:
            return (exp as ts.StringLiteral).text as T;

        default:
            log.info('arg kind', syntaxKindText(exp));
            return;
    }
}


function getItemRecursive(typeChecker: ts.TypeChecker, exp: ts.Node): SearchedItem | undefined {

    log.info('getItemRecursive:', syntaxKindText(exp));

    switch (exp.kind) {
        case ts.SyntaxKind.PropertyAccessExpression: {
            const propertyExp = exp as ts.PropertyAccessExpression;

            const symbol = typeChecker.getSymbolAtLocation(propertyExp);
            if (symbol) {
                // if(resolveSymbols) {
                //     return getItemRecursive(typeChecker, symbol.valueDeclaration);
                // }
                return { symbol };
            } else {
                log.warn('no symbol for PropertyAccessExpression');
            }
            return;
        }

        // case ts.SyntaxKind.ShorthandPropertyAssignment: {
        //     const assigment = exp as ts.ShorthandPropertyAssignment;
        //     if (assigment.objectAssignmentInitializer) {
        //         const result = this.getItemRecursive(typeChecker, assigment.objectAssignmentInitializer);
        //         if (result?.callName === ReducerFunctions.createReducer) {
        //             const symbol = typeChecker.getSymbolAtLocation(assigment.name);
        //             return symbol && { symbol };
        //         }
        //         return result;
        //     }
        //     return;
        // }


        // case ts.SyntaxKind.VariableDeclaration: {
        //     const declaration = exp as ts.VariableDeclaration;

        //     if (declaration.initializer) {
        //         const result = this.getItemRecursive(typeChecker, declaration.initializer);
        //         if (result?.callName === ReducerFunctions.createReducer) {
        //             const symbol = typeChecker.getSymbolAtLocation(declaration.name);
        //             return symbol && { symbol };
        //         }
        //         return result;
        //     }
        //     return;
        // }


        // case ts.SyntaxKind.CallExpression: {
        //     const callExp = exp as ts.CallExpression;

        //     if (ts.isIdentifier(callExp.expression)) {
        //         const callName = callExp.expression.getText();
        //         switch (callName) {
        //             case ReducerFunctions.createReducer:
        //                 return { callName };
        //             case ReducerFunctions.combineReducers: {
        //                 const reducerItems = this.extractCombineReducers(typeChecker, callExp);
        //                 return reducerItems && { registered: reducerItems };
        //             }
        //             default: {

        //                 const symbol = typeChecker.getSymbolAtLocation(callExp.expression);
        //                 if (symbol) {
        //                     return this.getItemRecursive(typeChecker, symbol.valueDeclaration as ts.Node);
        //                 } else {
        //                     log.warn('no symbol for callExpression:', callName);
        //                     return;
        //                 }

        //             }
        //         }

        //     }
        //     return this.getItemRecursive(typeChecker, callExp.expression);

        // }

        case ts.SyntaxKind.ArrowFunction: {
            const arrowFunction = exp as ts.ArrowFunction;
            return getItemRecursive(typeChecker, arrowFunction.body);
        }

        case ts.SyntaxKind.Block: {
            const block = exp as ts.Block;
            for (const statement of block.statements) {
                const reducer = getItemRecursive(typeChecker, statement);

                if (reducer) {
                    return reducer;
                }
            }

            return;

        }

        case ts.SyntaxKind.ReturnStatement: {
            const returnStatement = exp as ts.ReturnStatement;

            if (returnStatement.expression) {
                return getItemRecursive(typeChecker, returnStatement.expression);
            }

            return;

        }

        case ts.SyntaxKind.FunctionDeclaration: {
            const declaration = exp as ts.FunctionDeclaration;

            if (declaration.body) {
                return getItemRecursive(typeChecker, declaration.body);
            }

            return;

        }

        default:
            log.info(`getReducerRecursive - ${logColor.warn('Unknown argument kind')} [${syntaxKindText(exp)}] [${chalk.gray(exp.getSourceFile().fileName)}]`,
                EOL,
                chalk.gray(exp.getText())
            );
            return;
    }
}


function getNameOfDeclarationSymbol(node: ts.Declaration | ts.Expression, context: ConvertContext): ts.Symbol | undefined {
    const nameOfDeclaration = ts.getNameOfDeclaration(node);

    if (nameOfDeclaration) {
        let nameOfDeclarationSymbol = context.typeChecker.getSymbolAtLocation(nameOfDeclaration);

        if (nameOfDeclarationSymbol) {

            if (nameOfDeclarationSymbol.flags & ts.SymbolFlags.AliasExcludes) {
                nameOfDeclarationSymbol = context.typeChecker.getAliasedSymbol(nameOfDeclarationSymbol);
            }
        }
        return nameOfDeclarationSymbol;
    } else if (ts.isCallExpression(node)) {
        return getNameOfDeclarationSymbol(node.expression, context);
    }

    return;

}

class UniqueHelper<T> {

    private items = new Set<T>();

    add(item: T, withLog = false): boolean {
        if (!this.items.has(item)) {
            this.items.add(item);
            if (withLog) { devLogger.info('UniqueHelper:', chalk.gray(item)); }
            return true;
        }
        return false;
    }

    getItems(): T[] {
        return [...this.items.values()];
    }
}


const labUtils = {
    getItemRecursive,
    getValue,
    getNameOfDeclarationSymbol,
    UniqueHelper
};

export default labUtils;