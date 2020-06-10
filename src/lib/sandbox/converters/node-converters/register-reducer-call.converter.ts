import chalk from 'chalk';
import log from 'loglevel';
import { EOL } from 'os';
import ts from 'typescript';

import { ConvertContext } from '../../../core/converters';
import { NamedConvertedItem } from '../../../core/converters/models';
import { NodeConverter } from '../../../core/converters/node.converter';
import { syntaxKindText } from '../../../utils';
import { prepareToPrint, printNode } from '../../../utils/preparet-to-print';
import { RegisteredReducerItem } from '../models/registered-reducer.model';

enum ReducerFunctions {
    createReducer = 'createReducer',
    combineReducers = 'combineReducers'
}
interface ReducerSearchItem {
    symbol?: ts.Symbol;
    registered?: RegisteredReducerItem[];
    callName?: string;
}

export class RegisterReducerCallConverter extends NodeConverter {

    convert(context: ConvertContext, storeModuleCall: ts.CallExpression): NamedConvertedItem | undefined {
        let callName: string;

        const callSymbol = context.typeChecker.getSymbolAtLocation(storeModuleCall.expression);
        if (callSymbol) {
            callName = callSymbol.getName();
        } else {
            callName = storeModuleCall.expression.getText();
            log.debug('no call symbol for callName:', callName);
        }

        let name: string | undefined;
        let reducerSearchItem: ReducerSearchItem | undefined;
        switch (callName) {
            case 'StoreModule.forFeature':
            case 'forFeature': {
                name = this.getStringValue(context, storeModuleCall.arguments[0]) || 'noForFeatureKey';
                reducerSearchItem = this.getReducer(context, storeModuleCall.arguments[1]);
                break;
            }
            case 'StoreModule.forRoot':
                name = 'root';
                break;
            default:
                // log.warn('StoreModule not supported call:', callName);
                return;
        }

        // log.info(`registeredReducer [${name}]:`, reducerSearchItem);

        const registeredReducer = this.createRegisteredReducer(name, storeModuleCall, reducerSearchItem);
        return registeredReducer;

    }


    private createRegisteredReducer(
        name: string | undefined,
        srcNode: ts.Node,
        reducer: ReducerSearchItem | undefined
    ): RegisteredReducerItem {
        const registeredReducer = new RegisteredReducerItem(
            name || 'noName',
            srcNode.getSourceFile().fileName,
            srcNode.getStart(),
            srcNode.getEnd()
        );
        if (reducer) {
            registeredReducer.reducerItems = reducer.registered;
            registeredReducer.reducerSymbol = reducer.symbol;
        }
        return registeredReducer;
    }

    private symbolFlagsToString(flags: ts.SymbolFlags): string {
        let i = 0;
        let flag: number;
        let resultText = '';
        while (ts.SymbolFlags[flag = 1 << i++]) {
            if (flags & flag) {
                resultText += ts.SymbolFlags[flag];
            }
        }
        return resultText;
    }

    getReducer(context: ConvertContext, exp: ts.Node): ReducerSearchItem | undefined {
        const foundReducer = this.getReducerRecursive(context, exp);
        log.debug('getReducer:', prepareToPrint(foundReducer));
        if (foundReducer) {
            if (foundReducer.symbol?.flags) {
                log.debug('reducer symbol flags:', this.symbolFlagsToString(foundReducer.symbol.flags));
            }
        }
        return foundReducer;
    }



    private getReducerRecursive(context: ConvertContext, exp: ts.Node): ReducerSearchItem | undefined {

        log.trace('getReducerRecursive:', syntaxKindText(exp));

        switch (exp.kind) {
            case ts.SyntaxKind.PropertyAccessExpression: {
                const propertyExp = exp as ts.PropertyAccessExpression;

                const symbol = context.typeChecker.getSymbolAtLocation(propertyExp);
                if (symbol) {
                    return this.getReducerRecursive(context, symbol.valueDeclaration as ts.Node);
                } else {
                    log.warn('no symbol for PropertyAccessExpression');
                }
                return;
            }

            case ts.SyntaxKind.ShorthandPropertyAssignment: {
                const assigment = exp as ts.ShorthandPropertyAssignment;
                if (assigment.objectAssignmentInitializer) {
                    const result = this.getReducerRecursive(context, assigment.objectAssignmentInitializer);
                    if (result?.callName === ReducerFunctions.createReducer) {
                        const symbol = context.typeChecker.getSymbolAtLocation(assigment.name);
                        return symbol && { symbol };
                    }
                    return result;
                }
                return;
            }


            case ts.SyntaxKind.VariableDeclaration: {
                const declaration = exp as ts.VariableDeclaration;

                if (declaration.initializer) {
                    const result = this.getReducerRecursive(context, declaration.initializer);
                    if (result?.callName === ReducerFunctions.createReducer) {
                        const symbol = context.typeChecker.getSymbolAtLocation(declaration.name);
                        return symbol && { symbol };
                    }
                    return result;
                }
                return;
            }
            case ts.SyntaxKind.CallExpression: {
                const callExp = exp as ts.CallExpression;

                if (ts.isIdentifier(callExp.expression)) {
                    const callName = callExp.expression.getText();
                    switch (callName) {
                        case ReducerFunctions.createReducer:
                            return { callName };
                        case ReducerFunctions.combineReducers: {
                            const reducerItems = this.extractCombineReducers(context, callExp);
                            return reducerItems && { registered: reducerItems };
                        }
                        default: {

                            const symbol = context.typeChecker.getSymbolAtLocation(callExp.expression);
                            if (symbol) {
                                return this.getReducerRecursive(context, symbol.valueDeclaration as ts.Node);
                            } else {
                                log.warn('no symbol for callExpression:', callName);
                                return;
                            }

                        }
                    }

                }
                return this.getReducerRecursive(context, callExp.expression);

            }

            case ts.SyntaxKind.ArrowFunction: {
                const arrowFunction = exp as ts.ArrowFunction;
                return this.getReducerRecursive(context, arrowFunction.body);
            }

            case ts.SyntaxKind.Block: {
                const block = exp as ts.Block;
                for (const statement of block.statements) {
                    const reducer = this.getReducerRecursive(context, statement);

                    if (reducer) {
                        return reducer;
                    }
                }

                return;

            }

            case ts.SyntaxKind.ReturnStatement: {
                const returnStatement = exp as ts.ReturnStatement;

                if (returnStatement.expression) {
                    return this.getReducerRecursive(context, returnStatement.expression);
                }

                return;

            }

            case ts.SyntaxKind.FunctionDeclaration: {
                const declaration = exp as ts.FunctionDeclaration;

                if (declaration.body) {
                    return this.getReducerRecursive(context, declaration.body);
                }

                return;

            }

            default:
                log.info(`getReducerRecursive - Unknown argument kind [${syntaxKindText(exp)}] [${chalk.gray(exp.getSourceFile().fileName)}]`,
                    EOL,
                    chalk.gray(exp.getText())
                );
                return;
        }
    }

    private extractPropertyName(
        context: ConvertContext,
        node: ts.Identifier | ts.StringLiteral | ts.NumericLiteral | ts.ComputedPropertyName | ts.PrivateIdentifier
    ): string | undefined {

        switch (node.kind) {
            case ts.SyntaxKind.StringLiteral:
                return (node as ts.StringLiteral).text;
            case ts.SyntaxKind.ComputedPropertyName:
                {
                    const symbol = context.typeChecker.getSymbolAtLocation(node.expression);
                    if (symbol) {
                        return this.getStringValue(context, symbol.valueDeclaration);
                    }
                    log.warn('extractPropertyName symbol:', prepareToPrint(symbol), '\r\n', node.expression.getText());
                }
                break;
            default:
                log.warn('extractPropertyName:', syntaxKindText(node), prepareToPrint(node));
                break;
        }
        return;
    }

    private extractCombineReducers(context: ConvertContext, callExp: ts.CallExpression): RegisteredReducerItem[] | undefined {
        if (callExp.arguments.length > 0) {
            const [reducers] = callExp.arguments;

            if (ts.isObjectLiteralExpression(reducers)) {
                const registeredReducerItems = [];
                for (const property of reducers.properties) {
                    if (ts.isPropertyAssignment(property)) {
                        log.debug('combineReducers:', printNode(property, 5));
                        if (property.name) {
                            const name = this.extractPropertyName(context, property.name);
                            log.trace('extractCombineReducers propertyName:', name);
                            const reducer = this.getReducer(context, property.initializer);
                            if (reducer?.symbol) {
                                registeredReducerItems.push(this.createRegisteredReducer(name, reducer.symbol.valueDeclaration, reducer));
                            }
                            // log.info('extractCombineReducers reducer:', prepareToPrint(reducer));
                        }
                    }
                }

                if (registeredReducerItems.length) {
                    return registeredReducerItems;
                }
                //  reducers.
            }
        }
        return;
    }


    getStringValue(context: ConvertContext, exp: ts.Node): string | undefined {
        switch (exp.kind) {
            case ts.SyntaxKind.PropertyAccessExpression: {
                const propertyExp = exp as ts.PropertyAccessExpression;

                const symbol = context.typeChecker.getSymbolAtLocation(propertyExp);
                if (symbol) {
                    return this.getStringValue(context, symbol.valueDeclaration as ts.Node);
                } else {
                    log.warn('no symbol for PropertyAccessExpression');
                }
            }
                return;

            case ts.SyntaxKind.ShorthandPropertyAssignment: {
                const assigment = exp as ts.ShorthandPropertyAssignment;
                if (assigment.objectAssignmentInitializer) {
                    return this.getStringValue(context, assigment.objectAssignmentInitializer);
                }
                return;
            }


            case ts.SyntaxKind.VariableDeclaration: {
                const declaration = exp as ts.VariableDeclaration;
                if (declaration.initializer) {
                    return this.getStringValue(context, declaration.initializer);
                }
                return;
            }
            case ts.SyntaxKind.StringLiteral:
                return (exp as ts.StringLiteral).text;

            default:
                log.info('arg kind', syntaxKindText(exp));
                return;
        }
    }



}
