import chalk from 'chalk';
import { readFileSync } from 'fs';
import log from 'loglevel';
import ts from 'typescript';

import { globSync } from '../utils/glob';

export function printRecursiveFrom(
    node: ts.Node, indentLevel: number, sourceFile: ts.SourceFile
): void {

    if (!ts.isSourceFile(node)) {
        const indentation = ' '.repeat(indentLevel);
        const syntaxKind = ts.SyntaxKind[node.kind];
        const nodeText = node.getText(sourceFile);
        log.debug(`${indentation}${chalk.yellow(syntaxKind)}: ${nodeText}`);
    }
    node.forEachChild(child =>
        printRecursiveFrom(child, indentLevel + 1, sourceFile)
    );
}

function iterateFiles(fileNames: string[]): void {

    fileNames.forEach(fileName => {
        log.info('File:', fileName);
        const sourceFile = ts.createSourceFile(
            fileName,
            readFileSync(fileName).toString(),
            ts.ScriptTarget.ES2015,
        );

        log.info(chalk.blue('FILE: ', fileName));
        printRecursiveFrom(sourceFile, 0, sourceFile);
    });

}

export const printAst = (source: string): void => {
    log.info('printAst', source);
    const files = globSync(source, {});

    iterateFiles(files);
};
