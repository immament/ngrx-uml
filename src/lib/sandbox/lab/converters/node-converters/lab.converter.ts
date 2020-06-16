
import ts from 'typescript';

import { ConvertContext } from '../../../../core/converters';
import { NamedConvertedItem } from '../../../../core/converters/models';
import { NodeConverter } from '../../../../core/converters/node.converter';
import devLogger from '../../../../utils/logger';
import labUtils from '../../lab-utils';
import { KnownElementsService } from '../../services/known-elements.service';

// CallExpression - expression:  PropertyAccessExpression | ImportKeyword | Identifier | CallExpression




// TODO: move to context
const knownElements = new KnownElementsService();

// TODO: move to context

// TEMP
const uniqueHelper = new  labUtils.UniqueHelper;

export class LabConverter extends NodeConverter {

    convert(context: ConvertContext, node: ts.CallExpression): NamedConvertedItem | undefined {

        const nameOfDeclarationSymbol = labUtils.getNameOfDeclarationSymbol(node.expression, context);
        if (nameOfDeclarationSymbol) {
            const fullyQName = context.typeChecker.getFullyQualifiedName(nameOfDeclarationSymbol);

            const knownElement = knownElements.getElement(fullyQName);
            if (knownElement) {
                const item = knownElement.work(context, node);
                if (item) {

                    devLogger.info('LabConverter item:', !!item);
                    return item;
                }
            }
            else {
                // TEMP: to remove only dev diagnostic
                if (fullyQName.includes('@ngrx/')) {
                    uniqueHelper.add(fullyQName, true);
                }

            }
        } else {
           // devLogger.info(chalk.cyan('no nameOfDeclarationSymbol'), node.expression.getText());
        }
        return;
    }

}
