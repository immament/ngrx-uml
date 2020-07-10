import ts from 'typescript';

import { ConvertedItem } from '../../../../core/converters/models';
import { NodeConverter } from '../../../../core/converters/node.converter';
import labUtils from '../../lab-utils';
import { KnownElementsService } from '../../services/known-elements.service';
import { LabItemConvertContext } from '../lab-item-convert.context';

// CallExpression - expression:  PropertyAccessExpression | ImportKeyword | Identifier | CallExpression


// TEMP
//const uniqueHelper = new labUtils.UniqueHelper;

export class KnownElement2Converter extends NodeConverter {

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
                    return ;
                }
            }
        }
       
        return;
    }

}

