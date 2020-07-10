import chalk from 'chalk';
import log from 'loglevel';
import { EOL } from 'os';
import ts, { SymbolFlags } from 'typescript';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import _ts from '../../ts-internal';
import { currentStackLevel, logColor } from '../../utils/logger';
import { printNode } from '../../utils/preparet-to-print';
import tsutils, { syntaxKindLog } from '../../utils/tsutils';

const devLogger = log.getLogger('lab-utils');

export interface SearchedItem {
    item?: unknown;
    symbol?: ts.Symbol;
    items?: SearchedItem[];
}

const defaultNodeTextOptions: NodeTextOptions = { inOneLine: true, maxLength: 20, dots: true };

function nodeText(node: ts.Node, options?: NodeTextOptions): string {

    options = options ? { ...defaultNodeTextOptions, ...options } : defaultNodeTextOptions;

    const orgText = node.getText();

    let text = options.maxLength ? orgText.substr(0, options.maxLength) : orgText;
    if (options.inOneLine) {
        text = text.replace(new RegExp(EOL, 'g'), ' ').replace(new RegExp(' {2,}', 'g'), ' ');
    }

    text = text.trim();

    if (options.maxLength && orgText.length > options.maxLength) {
        if (options.dots) {
            text += '...';
        }
    }
    return chalk.gray(text);
}



function getFullyQualifiedName(symbol: ts.Symbol, typeChecker: ts.TypeChecker): string {

    const orgSymbol = symbol;
    if (symbol.flags & ts.SymbolFlags.AliasExcludes) {
        symbol = typeChecker.getAliasedSymbol(symbol);
    }

    let fqn = typeChecker.getFullyQualifiedName(symbol);

    if (!fqn.includes('"') && fqn !== 'unknown' && symbol.valueDeclaration) {

        const declaration = symbol.valueDeclaration;//  ? symbol.valueDeclaration : symbol.declarations[0];
        fqn = `"${declaration.getSourceFile().fileName}".${declaration.pos}-${declaration.end}-${fqn}`;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        devLogger.warn('internal symbol', symbolFlagsToString(symbol.flags), chalk.gray(fqn));
    }

    if (fqn === 'unknown' && orgSymbol !== symbol) {
        fqn = typeChecker.getFullyQualifiedName(orgSymbol);
        const importSpecifier = orgSymbol.declarations[0];
        if (importSpecifier && ts.isImportSpecifier(importSpecifier)) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            const moduleSpecifierText = getModuleSpecifierText(importSpecifier, typeChecker);
            if (moduleSpecifierText) {
                fqn = `"${moduleSpecifierText}".${fqn}`;
            }
        }
    }
    return fqn;
}

function getModuleSpecifierText(node: ts.ImportSpecifier, typeChecker: ts.TypeChecker): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return getValue<string>(typeChecker, node.parent.parent.parent.moduleSpecifier);
}

function printNodeInfo(node: ts.Node, typechecker: ts.TypeChecker): void {
    devLogger.info(logColor.warn('+ NODE INFO:', syntaxKindLog(node)), ': ', nodeText(node));

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
            log.info('arg kind', syntaxKindLog(exp));
            return;
    }
}


function getNodeLink(node: ts.Node, sourceFile?: ts.SourceFile): string {
    if (!sourceFile) {
        sourceFile = node.getSourceFile();
    }
    const start = node.getStart(sourceFile, true);
    const lineAndCharacter = ts.getLineAndCharacterOfPosition(sourceFile, start);
    return `${sourceFile.fileName}:${lineAndCharacter.line + 1}:${lineAndCharacter.character + 1}`;
}

function getReturnedChild(typeChecker: ts.TypeChecker, exp: ts.Node): (ts.Node | ts.Symbol)[] | undefined {

    devLogger.info('+ getReturnedChild:', syntaxKindLog(exp), nodeText(exp), getNodeLink(exp));

    if (exp.getSourceFile().isDeclarationFile) { // TODO: external
        return;
    }

    switch (exp.kind) {

        case ts.SyntaxKind.Identifier:
        case ts.SyntaxKind.PropertyAccessExpression: {

            // if (exp.localSymbol) {
            //     log.warn('  local symbol');
            //     return [exp.localSymbol.valueDeclaration];
            // }


            const symbol = typeChecker.getSymbolAtLocation(exp);

            if (!symbol) {
                log.warn('  no symbol for', syntaxKindLog(exp), nodeText(exp, { maxLength: 40 }));
                return;
            }

            if (symbol.flags & SymbolFlags.BlockScopedVariable) {
                devLogger.warn('  BlockScopedVariable', nodeText(exp, { maxLength: 40 }), printNode(symbol.valueDeclaration));
            }

            return [symbol];

        }

        case ts.SyntaxKind.VariableDeclaration: {
            const variableDeclaration = exp as ts.VariableDeclaration;
            return variableDeclaration.initializer && [variableDeclaration.initializer];
        }

        case ts.SyntaxKind.CallExpression: {
            const callExp = exp as ts.CallExpression;

            return [callExp.expression];
        }

        case ts.SyntaxKind.ArrowFunction: {
            const arrowFunction = exp as ts.ArrowFunction;
            return [arrowFunction.body];
        }

        case ts.SyntaxKind.Block: {
            const block = exp as ts.Block;
            const returnStatement = [...block.statements].find(s => s.kind === ts.SyntaxKind.ReturnStatement);
            if (returnStatement) {
                return [returnStatement];
            }
            return;
        }

        case ts.SyntaxKind.ReturnStatement: {
            const returnStatement = exp as ts.ReturnStatement;

            return returnStatement.expression && [returnStatement.expression];

        }

        case ts.SyntaxKind.FunctionDeclaration: {
            const declaration = exp as ts.FunctionDeclaration;
            if (declaration.body) {
                return [declaration.body];
            }
            return;
        }


        case ts.SyntaxKind.ObjectLiteralExpression: {
            const objectLiteralExp = exp as ts.ObjectLiteralExpression;

            return [...objectLiteralExp.properties];


        }

        case ts.SyntaxKind.PropertyAssignment: {
            const assigment = exp as ts.PropertyAssignment;
            return [assigment.initializer];
        }

        case ts.SyntaxKind.ArrayLiteralExpression: {
            const arrayLiteralExpression = exp as ts.ArrayLiteralExpression;
            return [...arrayLiteralExpression.elements];
        }



        case ts.SyntaxKind.ClassDeclaration: {
            const classDeclaration = exp as ts.ClassDeclaration;

            devLogger.debug('  class declaration', classDeclaration.name?.escapedText);
            return [];
        }

        default:

            devLogger.warn(`- getReturnedChild - ${logColor.warn('Unknown argument kind')} [${syntaxKindLog(exp)}] [${chalk.gray(exp.getSourceFile().fileName)}]`,
                EOL, nodeText(exp, { maxLength: 100 }),
                // EOL, printNode(exp),
                EOL, currentStackLevel()
            );
            return;
    }
}

function getReturnedChildRecursive(typeChecker: ts.TypeChecker, exp: ts.Node): ts.Symbol[] | undefined {
    let result: ts.Node | ts.Symbol | (ts.Node | ts.Symbol)[] | undefined = exp;
    do {
        result = getReturnedChild(typeChecker, result);

    } while (result && tsutils.isNode(result));

    if (!result) {
        devLogger.info('result undefined', nodeText(exp));
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return arrayResult(typeChecker, result);

}


function arrayResult(typeChecker: ts.TypeChecker, arr: (ts.Node | ts.Symbol)[]): ts.Symbol[] | undefined {
    const results = [];
    for (const item of arr) {
        if (tsutils.isSymbol(item)) {
            results.push(item);
        } else if (tsutils.isNode(item)) {
            const result = getReturnedChildRecursive(typeChecker, item);
            if (result) {
                results.push(...result);
            }
        }
    }
    return results.length > 0 ? results : undefined;
}

function getNameOfDeclarationSymbol(node: ts.Declaration | ts.Expression, typeChecker: ts.TypeChecker): ts.Symbol | undefined {
    const nameOfDeclaration = ts.getNameOfDeclaration(node);

    if (nameOfDeclaration) {
        let nameSymbol = typeChecker.getSymbolAtLocation(nameOfDeclaration);
        devLogger.info('nameSymbol:', nameSymbol?.escapedName);
        if (nameSymbol && nameSymbol.flags & ts.SymbolFlags.AliasExcludes) {
            const aliasedSymbol = typeChecker.getAliasedSymbol(nameSymbol);
            if (!typeChecker.isUnknownSymbol(aliasedSymbol)) {
                nameSymbol = aliasedSymbol;
            }
        }
        return nameSymbol;
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



function isFqnFromExternalLibrary(fqn: string): boolean {
    return fqn.includes('/node_modules/');
}

function isSourceFileFromExternalLibrary(sf: ts.SourceFile): boolean {
    return sf.fileName.includes('/node_modules/') || (!sf.fileName.startsWith('".') && !sf.fileName.startsWith('"/'));
}

function symbolFlagsToString(flags: ts.SymbolFlags): string {
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



export interface NodeTextOptions {
    inOneLine?: boolean;
    maxLength?: number;
    dots?: boolean;
}

const labUtils = {
    getValue,
    getNameOfDeclarationSymbol,
    printSymbols,
    nodeText,
    getReturnedChild,
    getReturnedChildRecursive,
    getFullyQualifiedName,
    isSourceFileFromExternalLibrary,
    isFqnFromExternalLibrary,
    symbolFlagsToString,
    UniqueHelper
};

export default labUtils;