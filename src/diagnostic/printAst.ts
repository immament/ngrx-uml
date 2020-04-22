import chalk from 'chalk';
import { readFileSync } from 'fs';
import log from 'loglevel';
import { EOL } from 'os';
import ts from 'typescript';

import { globSync } from '../utils/glob';

export function printAstRecursiveFrom(
    node: ts.Node, sourceFile: ts.SourceFile, indentLevel: number, lines: string[]
): void {
    if (!ts.isSourceFile(node)) {
        const indentation = ' '.repeat(indentLevel);
        const syntaxKind = ts.SyntaxKind[node.kind];
        const nodeText = node.getText(sourceFile);
        lines.push(`${indentation}${chalk.yellow(syntaxKind)}: ${nodeText}`);
    }
    node.forEachChild(child =>
        printAstRecursiveFrom(child, sourceFile, indentLevel + 1, lines)
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
        const lines: string[] = [];
        printAstRecursiveFrom(sourceFile, sourceFile, 0,  lines);
        log.info(lines.join(EOL));
    });

}

export const printAst = (source: string): void => {
    log.info('printAst', source);
    const files = globSync(source, {});

    iterateFiles(files);
};
