import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

import { globSync } from '../utils/glob';
import { createProgram } from '../utils/tsutils';

function recursivelyPrintVariableDeclarations(
    node: ts.Node, sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker
): void {
  if (ts.isVariableDeclaration(node))  {
        const kind = ts.SyntaxKind[node.kind]; 
        const type = typeChecker.getTypeAtLocation(node);
        const typeName = typeChecker.typeToString(type, node);
     
        log.info(`${chalk.yellow(kind)} :  (${typeName})`);
    }

    node.forEachChild(child =>
        recursivelyPrintVariableDeclarations(child, sourceFile, typeChecker)
    );
}

export const printAstVariablesInProgram = (source: string,  baseDir: string, configName: string): void => {
  log.info('printAstInProgram', source, baseDir, configName);
  const files = globSync(source, {});
 
  if(!files || files.length<1 ) {
    log.info('No files found');
    return;
  }
  const program =   createProgram(files, baseDir, configName);

  const fileName = files[0]; 
  log.info(`File: ${chalk.yellow(fileName)}`);

  const sourceFile = program.getSourceFile(fileName);
  const typeChecker = program.getTypeChecker();
  if (sourceFile) {
    recursivelyPrintVariableDeclarations(sourceFile, sourceFile, typeChecker);
  }
};

