import log from 'loglevel';
import ts from 'typescript';

import { globSync } from '../utils/glob';

function recursivelyPrintVariableDeclarations(
    node: ts.Node, sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker
): void {
    if (ts.isVariableDeclaration(node))  {
        // const nodeText = node.getText(sourceFile);
        // log.debug(nodeText);
        
        const kind = ts.SyntaxKind[node.kind]; 
        const type = typeChecker.getTypeAtLocation(node);
        const typeName = typeChecker.typeToString(type, node);

     
        log.debug(`${kind} :  (${typeName})`);
    }

    node.forEachChild(child =>
        recursivelyPrintVariableDeclarations(child, sourceFile, typeChecker)
    );
}

const iterateFiles = (files: string[]): void => {
  
  const program = ts.createProgram(files, {});
  const sourceFile = program.getSourceFile(files[0]);
  const typeChecker = program.getTypeChecker();
  if (sourceFile) {
    recursivelyPrintVariableDeclarations(sourceFile, sourceFile, typeChecker)
  }

};

export const printVariables = (source: string, outDir: string): void => {
  log.debug('printVariables', source, outDir);
  const files = globSync(source, {});
 
  iterateFiles(files)
}

