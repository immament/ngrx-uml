import { readFileSync } from 'fs';
import log from 'loglevel';
import ts from 'typescript';

export function delint(sourceFile: ts.SourceFile): unknown[] {
    const actions: unknown[] = [];

    const isCreateAction = (initializer: ts.Expression): boolean => {
        return initializer ? (initializer as unknown as { expression: { escapedText: string } }).expression.escapedText === 'createAction' : false;
    };

    function delintNode(node: ts.Node): void {
        //  log.debug(node);
        switch (node.kind) {
            case ts.SyntaxKind.VariableStatement: {
                const variableStatment = node as ts.VariableStatement;
                for (const declaration of variableStatment.declarationList.declarations) {
                    const initializer = declaration.initializer;
                    if (!initializer || !ts.isCallExpression(initializer)) {
                        continue;
                    }
                    log.debug('init: ', initializer.kind)
                    const isAction = isCreateAction(initializer);
                    if (isAction) {
                        actions.push(declaration);
                    }
                }
            }
                break;
        }

        ts.forEachChild(node, delintNode);
    }


    delintNode(sourceFile);
    return actions;
}


export function ast(fileNames: string[]): void {


    fileNames.forEach(fileName => {
        log.debug(fileName);
        const sourceFile = ts.createSourceFile(
            fileName,
            readFileSync(fileName).toString(),
            ts.ScriptTarget.ES2015,
        );

        // delint it
        const result = delint(sourceFile);
        log.debug(result.length);
    });

}