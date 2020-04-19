import log from 'loglevel';
import * as tsutils from 'tsutils';
import ts from 'typescript';

import { globSync } from '../utils/glob';
import { syntaxKindText } from '../utils/tsutils';

function recursive(sourceFile: ts.SourceFile, _typeChecker: ts.TypeChecker): void {

    const result = tsutils.findImports(sourceFile, tsutils.ImportKind.All);

    const imp = result.find((v) => v.text.endsWith('/state.service'))


    if (imp) {
        const importDeclartion = imp.parent as ts.ImportDeclaration;
        if (importDeclartion.importClause && ts.isImportClause(importDeclartion.importClause)) {

            const importClause = importDeclartion.importClause;
            if (importClause.namedBindings) {
                if (ts.isNamedImports(importClause.namedBindings)) {
                    log.debug({ ...importClause.namedBindings.elements, parent: undefined });
                    log.debug(syntaxKindText(importClause.namedBindings));
                }
            }
        }
    }
}

const iterateFiles = (files: string[]): void => {


    const program = ts.createProgram(files, {});
    const typeChecker = program.getTypeChecker();

    for (const file of files) {
        const sourceFile = program.getSourceFile(file);
        if (sourceFile) {
            recursive(sourceFile, typeChecker);
        }
    }

}




export const checkUtils = (source: string, outDir: string): void => {
    log.debug('checkUtils', source, outDir);
    const files = globSync(source, {});

    iterateFiles(files);
}