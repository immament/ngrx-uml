import chalk from 'chalk';
import log from 'loglevel';
import { EOL } from 'os';
import ts, { VariableDeclaration } from 'typescript';

import devLogger, { currentStackLevel, logColor } from '../../utils/logger';
import { printNode } from '../../utils/preparet-to-print';
import { syntaxKindText } from '../../utils/tsutils';

export interface SearchedItem {
    item?: unknown;
    symbol?: ts.Symbol;
}

function printNodeInfo(node: ts.Node, typechecker: ts.TypeChecker): void {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    devLogger.info(logColor.warn('+ NODE INFO:', syntaxKindText(node)), ': ', nodeText(node));

    const symbol = typechecker.getSymbolAtLocation(node);

    if (symbol) {
        devLogger.info(logColor.info('symbol FQN:'), typechecker.getFullyQualifiedName(symbol));
        devLogger.info(logColor.info('symbolToString:'), typechecker.symbolToString(symbol));

        const typeOfSymbol = typechecker.getTypeOfSymbolAtLocation(symbol, node);
        devLogger.info(logColor.info('getTypeOfSymbolAtLocation:'), typechecker.typeToString(typeOfSymbol));
        const declaredTypeOfSymbol = typechecker.getDeclaredTypeOfSymbol(symbol);
        devLogger.info(logColor.info('getDeclaredTypeOfSymbol:'), typechecker.typeToString(declaredTypeOfSymbol));
    }

    devLogger.info(logColor.info('getTypeAtLocation:'), typechecker.typeToString(typechecker.getTypeAtLocation(node)));
    devLogger.info(logColor.info('getShorthandAssignmentValueSymbol has:'), !!typechecker.getShorthandAssignmentValueSymbol(node));

}

function printSymbols(node: ts.Node, typechecker: ts.TypeChecker): void {

    printNodeInfo(node, typechecker);

    if (ts.isAsExpression(node)) {
        const contextualType = typechecker.getContextualType(node);
        devLogger.info('contextualType:', !!contextualType);

    }

    node.forEachChild((child) => printSymbols(child, typechecker));
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

    // log.info('getItemRecursive:', syntaxKindText(exp));

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


        case ts.SyntaxKind.CallExpression: {
            const callExp = exp as ts.CallExpression;
            devLogger.info('+ callExpression:', chalk.gray(callExp.getText()));
            // printSymbols(callExp, typeChecker);
            // const nameOfDeclarationSymbol = getNameOfDeclarationSymbol(callExp.expression, typeChecker);

            // if (nameOfDeclarationSymbol) {
            //     const fullyQName = typeChecker.getFullyQualifiedName(nameOfDeclarationSymbol);
            //     devLogger.info('nameOfDeclarationSymbol:', chalk.gray(fullyQName));

            //     return;

            // }

            return;

        }

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
            log.info(`getItemRecursive - ${logColor.warn('Unknown argument kind')} [${syntaxKindText(exp)}] [${chalk.gray(exp.getSourceFile().fileName)}]`,
                EOL, chalk.gray(exp.getText()),
                EOL, currentStackLevel()
            );
            return;
    }
}



function getChilds(typeChecker: ts.TypeChecker, exp: ts.Node): ts.Node[] | ts.Symbol {

    devLogger.trace('+ getChilds:', syntaxKindText(exp));

    switch (exp.kind) {

        case ts.SyntaxKind.Identifier:
        case ts.SyntaxKind.PropertyAccessExpression: {

            if (exp.localSymbol) {
                return [exp.localSymbol.valueDeclaration];
            }
            const symbol = typeChecker.getSymbolAtLocation(exp);


            if (symbol) {
                // if (symbol.flags & ts.SymbolFlags.BlockScoped) {
                //     return symbol.declarations;
                // }
                return symbol;
            } else {
                log.warn('no symbol for PropertyAccessExpression');
            }

            return [];
        }

        case ts.SyntaxKind.VariableDeclaration: {
            const variableDeclaration = exp as ts.VariableDeclaration;
            return variableDeclaration.initializer ? [variableDeclaration.initializer]:  [];
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


        // case ts.SyntaxKind.VariableDeclarationList: {
        //     if (ts.isVariableDeclarationList(exp)) {
        //         return [...exp.declarations];
        //     } 
        //     return [];

        // }


        // case ts.SyntaxKind.FirstStatement: {
        //     if (ts.isVariableStatement(exp)) {
        //         devLogger.info('FirstStatement: isVariableStatement');
        //         return [exp.declarationList];
        //     } else {
        //         devLogger.warn('FirstStatement: IS NOT VariableStatement');

        //     }
        //     return [];

        // }

        case ts.SyntaxKind.CallExpression: {
            const callExp = exp as ts.CallExpression;
            devLogger.info('+ callExpression:', chalk.gray(callExp.getText()));

            printNodeInfo(callExp, typeChecker);
            // const nameOfDeclarationSymbol = getNameOfDeclarationSymbol(callExp.expression, typeChecker);

            // if (nameOfDeclarationSymbol) {
            //     const fullyQName = typeChecker.getFullyQualifiedName(nameOfDeclarationSymbol);
            //     devLogger.info('nameOfDeclarationSymbol:', chalk.gray(fullyQName));

            //     return;

            // }

            return [callExp.expression];

        }

        case ts.SyntaxKind.ArrowFunction: {
            const arrowFunction = exp as ts.ArrowFunction;
            return [arrowFunction.body];
        }

        case ts.SyntaxKind.Block: {
            const block = exp as ts.Block;
            return [...block.statements].filter(s => s.kind === ts.SyntaxKind.ReturnStatement);


        }

        case ts.SyntaxKind.ReturnStatement: {
            const returnStatement = exp as ts.ReturnStatement;

            return returnStatement.expression ? [returnStatement.expression] : [];

        }

        case ts.SyntaxKind.FunctionDeclaration: {
            const declaration = exp as ts.FunctionDeclaration;
            if (declaration.body) {
                return [declaration.body];
            }
            return [];
        }




        default:
            log.info(`- getChilds - ${logColor.warn('Unknown argument kind')} [${syntaxKindText(exp)}] [${chalk.gray(exp.getSourceFile().fileName)}]`,
                EOL, chalk.gray(exp.getText()),
                EOL, printNode(exp),
                EOL, currentStackLevel()
            );
            return [];
    }
}



function getNameOfDeclarationSymbol(node: ts.Declaration | ts.Expression, typeChecker: ts.TypeChecker): ts.Symbol | undefined {
    const nameOfDeclaration = ts.getNameOfDeclaration(node);

    if (nameOfDeclaration) {
        let nameOfDeclarationSymbol = typeChecker.getSymbolAtLocation(nameOfDeclaration);

        if (nameOfDeclarationSymbol) {

            if (nameOfDeclarationSymbol.flags & ts.SymbolFlags.AliasExcludes) {
                nameOfDeclarationSymbol = typeChecker.getAliasedSymbol(nameOfDeclarationSymbol);
            }
        }
        return nameOfDeclarationSymbol;
    } else if (ts.isCallExpression(node)) {
        // return getNameOfDeclarationSymbol(node.expression, typeChecker);
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


function nodeText(node: ts.Node, options = { inOneLine: true, maxLength: 20, dots: true }): string {

    const orgText = node.getText();
    let text = orgText.substr(0, options.maxLength);
    if (options.inOneLine) {
        text = text.replace(EOL, ' ');
    }

    text = text.trim();

    if (orgText.length > options.maxLength) {
        if (options.dots) {
            text += '...';
        }
    }



    return text;
}

const labUtils = {
    getItemRecursive,
    getValue,
    getNameOfDeclarationSymbol,
    printSymbols,
    nodeText,
    getChilds,
    UniqueHelper
};

export default labUtils;