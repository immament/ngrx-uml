
// import log from 'loglevel';
// import ts from 'typescript';

// import { ActionWithSymbol } from './models/action-with-symbol.model';

// export default function searchActionsInFile(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker): ActionWithSymbol[] {

//     const context = new ConvertContext({} as ts.Program, typeChecker);

//     function main(): ActionWithSymbol[] {
//         // eslint-disable-next-line @typescript-eslint/no-use-before-define
//         sourceFile.forEachChild(searchActionsInNode);
//         return context.actions;
//     }

//     return main();

//     function searchActionsInNode(node: ts.Node): void {
//         log.trace('searchActionsInNode', node);
//         switch (node.kind) {
//             case ts.SyntaxKind.VariableDeclaration: {
//                 const action = context.convertNode(node);

//                 if (action) {
//                     return;
//                 }
//                 break;
//             }
//         }
//         node.forEachChild(child => {
//             searchActionsInNode(child);
//         });
//     }


// }
