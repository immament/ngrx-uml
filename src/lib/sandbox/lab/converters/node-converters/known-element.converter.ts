import ts from 'typescript';

import { ConvertedItem } from '../../../../core/converters/models';
import { NodeConverter } from '../../../../core/converters/node.converter';
import labUtils from '../../lab-utils';
import { KnownElementsService } from '../../services/known-elements.service';
import { LabItemConvertContext } from '../lab-item-convert.context';

// CallExpression - expression:  PropertyAccessExpression | ImportKeyword | Identifier | CallExpression


// TEMP
//const uniqueHelper = new labUtils.UniqueHelper;

export class KnownElementConverter extends NodeConverter {

    constructor(
        private readonly knownElements: KnownElementsService
    ) {
        super();
    }

    convert(context: LabItemConvertContext, node: ts.CallExpression): ConvertedItem | undefined {

        const nameOfDeclaration = ts.getNameOfDeclaration(node.expression);

        if (nameOfDeclaration) {
            let nameOfDeclarationSymbol = labUtils.getNameOfDeclarationSymbol(node.expression, context.typeChecker);

            let fqn: string | undefined;
            if (nameOfDeclarationSymbol) {
                if (context.typeChecker.isUnknownSymbol(nameOfDeclarationSymbol) && nameOfDeclaration) {
                    nameOfDeclarationSymbol = context.typeChecker.getSymbolAtLocation(nameOfDeclaration);
                    if (!nameOfDeclarationSymbol) {
                        return;
                    }
                }

                fqn = labUtils.getFullyQualifiedName(nameOfDeclarationSymbol, context.typeChecker);

            }

            if (!nameOfDeclarationSymbol) {
                if (nameOfDeclaration.getText() === 'pipe') {
                    fqn = 'Mock/Observable".Observable.pipe';
                } 
            }
            if(!fqn) {
                return;
            }


            const knownElement = this.knownElements.getElement(fqn);
            if (knownElement) {
                NodeConverter.devLogger.info('  knownElement', labUtils.nodeText(node));

                const item = knownElement.work(context, node, nameOfDeclarationSymbol);
                if (item) {
                    NodeConverter.devLogger.warn(`- converted know element: [${item.kindText}] ${item.name}`);
                    return item;
                }
            }
        }
        // else {
        //     // TEMP: to remove only dev diagnostic
        //     if (fqn.includes('NgModule')) {
        //         devLogger.warn('fqn:', fqn);
        //         // uniqueHelper.add(fullyQName, true);
        //     }

        // }

        return;
    }

}


// if (ts.isPropertyAccessExpression(exp) && exp.name.escapedText === 'pipe') {

//     const s = {
//         escapedName: 'Mock/Observable".Observable.pipe' as ts.__String
//     } as ts.Symbol;

//     log.info('  no symbol for ',  typeChecker.getFullyQualifiedName(s));

//     exp.name.localSymbol = s;
//     return [exp.name ];
//     //return [s];
// }
// if (ts.isPropertyAccessExpression(exp)) {

//     // eslint-disable-next-line @typescript-eslint/no-use-before-define
//     //const ch = getReturnedChild(typeChecker, exp.expression);

//     const expSymbol = typeChecker.getSymbolAtLocation(exp.expression);
//     if (expSymbol) {
//         if (ts.isParameter(expSymbol.valueDeclaration)) {
//             if (expSymbol.valueDeclaration.type && ts.isTypeReferenceNode(expSymbol.valueDeclaration.type)) {

//                 const typeSymbol = typeChecker.getSymbolAtLocation(expSymbol.valueDeclaration.type.typeName);
//                 if (typeSymbol) {
//                     log.info('  typeSymbol', syntaxKindLog(exp), getFullyQualifiedName(typeSymbol, typeChecker));
//                 }
//             }
//         }
//     }
// }
